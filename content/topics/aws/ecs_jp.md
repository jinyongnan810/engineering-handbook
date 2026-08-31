# ECS と Fargate

## サーバー管理不要なコンテナの実行

常時稼働するマイクロサービス、Web サーバー、または Docker コンテナで構築された API バックエンドを実行する場合、**Amazon ECS (Elastic Container Service)** と **AWS Fargate** を組み合わせて使用します。

AWS におけるコンテナ管理には、主に4つの基本要素があります:

- **Amazon ECS（オーケストレーター）:** 環境全体でコンテナ化されたアプリケーションのスケジューリング、デプロイ、監視を行うコントロールプレーンです。
- **AWS Fargate（サーバーレスコンピュートエンジン）:** EC2 インスタンスのプロビジョニング、インスタンスタイプの選定、ホスト OS の更新管理を行う代わりに、コンテナの実行基盤をサーバーレスで提供します。必要な CPU とメモリを指定するだけで、AWS が基盤インフラを自動的に管理します。
- **タスク定義（Task Definition / 設計図）:** コンテナ構成を定義する JSON 仕様書。取得する Docker イメージ（ECR または Docker Hub）、CPU/メモリ制限、ポートマッピング、環境変数、ログ設定などを指定します。
- **ECS サービス（Service / コントローラー）:** 指定されたタスク数（`desired_count`）が常に稼働し続けるよう制御します。コンテナがクラッシュした場合、ECS サービスは障害タスクを自動的に破棄し、新しいタスクを起動して可用性を維持します。

### ECS における IAM ロール

ECS では明確に分かれた2種類の IAM ロールを使用します:

1. **タスク実行ロール (Task Execution Role):** _AWS Fargate エージェント自体_ が使用します（AWS ECR からの Docker イメージのプル、CloudWatch Logs へのコンテナログの送信など）。
2. **タスクロール (Task Role):** コンテナ内部で動作する _アプリケーションコード_ が使用します（Node.js や Python アプリが S3 バケットや DynamoDB テーブルにアクセスする場合など）。

---

### 設定例

```hcl
# Nginxコンテナを実行するECS Fargateサービス（CloudWatchログおよびIAMロールを含む）の作成

# 1. コンテナログ用の CloudWatch ロググループ
resource "aws_cloudwatch_log_group" "ecs_logs" {
  name              = "/ecs/nginx-app"
  retention_in_days = 7
}

# 2. IAM タスク実行ロール（Fargateエージェントがイメージ取得やログ書き込みに使用）
data "aws_iam_policy_document" "ecs_task_execution_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ecs_execution_role" {
  name               = "ecsTaskExecutionRole"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_execution_assume_role.json
}

resource "aws_iam_role_policy_attachment" "ecs_execution_attach" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# 3. ECS クラスター
resource "aws_ecs_cluster" "app_cluster" {
  name = "production-ecs-cluster"
}

# 4. ECS タスク定義（コンテナの設計図）
resource "aws_ecs_task_definition" "app_task" {
  family                   = "nginx-task"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc" # Fargate では awsvpc が必須
  cpu                      = "256"    # 0.25 vCPU
  memory                   = "512"    # 512 MB
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "nginx-container"
      image     = "public.ecr.aws/docker/library/nginx:latest"
      essential = true

      portMappings = [
        {
          containerPort = 80
          hostPort      = 80
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_logs.name
          "awslogs-region"        = "ap-northeast-1"
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}

# 5. ECS サービス（コンテナの稼働を維持）
resource "aws_ecs_service" "app_service" {
  name            = "nginx-service"
  cluster         = aws_ecs_cluster.app_cluster.id
  task_definition = aws_ecs_task_definition.app_task.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.private_subnet.id, aws_subnet.private_subnet_2.id]
    security_groups  = [aws_security_group.ecs_sg.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.app_tg.arn
    container_name   = "nginx-container"
    container_port   = 80
  }

  # リスナーが作成されてからサービスを起動する
  depends_on = [aws_lb_listener.http]
}
```

**主なコードの解説:**

- **`network_mode = "awsvpc"`:** Fargate では `awsvpc` ネットワークモードが必須です。各タスクに専用の Elastic Network Interface (ENI) と VPC サブネット内のプライベート IP アドレスが割り当てられます。
- **`AmazonECSTaskExecutionRolePolicy`:** Fargate エージェントが CloudWatch にログを出力し、コンテナレジストリからイメージを取得するために必要な最小権限を提供する AWS 管理ポリシーです。
- **`jsonencode([...])`:** コンテナの設定パラメータ（イメージ、CPU/メモリ割り当て、ポート、ログドライバ）を Terraform 構文内でシンプルに定義します。

![ECS アーキテクチャ](https://ik.imagekit.io/kinn/my%20assets/ecs.png)
