# ALB (Application Load Balancer)

## コンテナ間でのトラフィック分散

**Application Load Balancer (ALB)** は、ECS/Fargate サービスの前段に配置されるパブリックな入り口（エントリポイント）であり、受信した HTTP/HTTPS トラフィックを実行中のタスク群に均等に分散します。Fargate タスクはエフェメラル（一時的）であり、VPC 内でタスクごとに固有のプライベート IP が割り当てられ、クラッシュやスケーリングによって IP が頻繁に変化するため、クライアントが直接タスクと通信することはできません。ALB は単一の安定した DNS 名を提供し、健全な（正常な）ターゲットにのみリクエストを継続的にルーティングすることでこの問題を解決します。

ALB はレイヤー7（アプリケーション層）で動作するため、各 HTTP リクエストの内容を検査し、リクエストパス、ホストヘッダー、送信元 IP、その他の属性に基づいて柔軟なルーティング判断を行うことができます。

主に4つの主要コンポーネントがあります:

- **ロードバランサー (Load Balancer):** パブリックサブネットに配置され、受信トラフィックを受け付けるインターネット公開リソース。どのポートや送信元を許可するかを制御するセキュリティグループに関連付けられます。
- **ターゲットグループ (Target Group):** トラフィックを受け取るバックエンドの論理グループ。Fargate の場合、各タスクが EC2 インスタンス ID ではなくプライベート IP で登録されるため、ターゲットタイプは `ip` である必要があります。また、タスクがリクエストを処理可能かを判断するヘルスチェックもここで定義します。
- **リスナー (Listener):** 設定されたポートとプロトコル（HTTP:80 など）で接続リクエストを待ち受け、ルールに従ってターゲットグループに転送するプロセス。
- **リスナールール (Listener Rules):** 優先順位に従って評価される一連の条件。リクエストパスや送信元 IP に基づいて、転送・リダイレクト・固定レスポンスの返却などのきめ細かな制御が可能です。

### セキュリティグループ

2つのセキュリティグループが連携して安全な通信チェーンを形成します:

1. **ALB セキュリティグループ:** インターネットの公開窓口であるため、インターネット全体 (`0.0.0.0/0`) からのインバウンド HTTP（ポート 80）を許可します。
2. **ECS タスク用セキュリティグループ:** インターネットから直接ではなく、**ALB のセキュリティグループからのみ** インバウンドトラフィックを許可します。これにより、コンテナへの直接アクセスを完全に防ぎ、必ずロードバランサー経由でのみアクセスできるように保護します。

---

## 設定例

```hcl
# ECS サービスをインターネットに公開するための Application Load Balancer の設定

# 1. ALB 用のセキュリティグループ（インターネットからの HTTP を許可）
resource "aws_security_group" "alb_sg" {
  name        = "alb-sg"
  description = "インターネットからのインバウンド HTTP を許可"
  vpc_id      = aws_vpc.main_vpc.id

  ingress {
    description = "インターネットからの HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "alb-sg"
  }
}

# 2. ECS タスク用のセキュリティグループ（ALB からのトラフィックのみ許可）
resource "aws_security_group" "ecs_sg" {
  name        = "ecs-tasks-sg"
  description = "ALB からのインバウンドトラフィックのみ許可"
  vpc_id      = aws_vpc.main_vpc.id

  ingress {
    description     = "ALB からのアプリケーションポート"
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "ecs-tasks-sg"
  }
}

# 3. Application Load Balancer（パブリックサブネットに配置）
resource "aws_lb" "app_alb" {
  name               = "production-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = [aws_subnet.public_subnet.id, aws_subnet.public_subnet_2.id]

  tags = {
    Name = "production-alb"
  }
}

# 4. ターゲットグループ（Fargate/awsvpc には target_type "ip" が必須）
resource "aws_lb_target_group" "app_tg" {
  name        = "production-app-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main_vpc.id
  target_type = "ip"

  health_check {
    path                = "/"
    protocol            = "HTTP"
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }

  tags = {
    Name = "production-app-tg"
  }
}

# 5. リスナー（HTTP:80 をターゲットグループに転送）
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.app_alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app_tg.arn
  }
}

# 6. ルール: 信頼できる特定 IP からの /admin/* のみ許可（最優先で評価）
resource "aws_lb_listener_rule" "admin_allow" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 10

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app_tg.arn
  }

  condition {
    path_pattern {
      values = ["/admin/*"]
    }
  }

  condition {
    source_ip {
      values = ["203.139.59.153/32"]
    }
  }
}

# 7. ルール: その他の /admin/* リクエストには 403 エラーを即座に返却
resource "aws_lb_listener_rule" "admin_deny" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 20

  action {
    type = "fixed-response"

    fixed_response {
      content_type = "text/html"
      status_code  = "403"
      message_body = "<html><body><h1>403 Access Denied</h1></body></html>"
    }
  }

  condition {
    path_pattern {
      values = ["/admin/*"]
    }
  }
}

# 便利な出力: ロードバランサーのパブリック URL
output "alb_dns_name" {
  value       = aws_lb.app_alb.dns_name
  description = "Application Load Balancer のパブリック DNS 名"
}
```

**主なコードの解説:**

- **`target_type = "ip"`:** Fargate に必須の設定です。`awsvpc` ネットワークによって各タスクに個別のプライベート IP が付与されるため、ターゲットは EC2 インスタンス ID ではなく IP アドレスとして登録されます。
- **セキュリティグループの連鎖 (Chaining):** ECS タスクのセキュリティグループの `ingress` で、CIDR 範囲ではなく ALB のセキュリティグループ ID を指定しています。これにより、ALB 経由のトラフィックのみを受け入れるようにコンテナが隔離されます。
- **`health_check`:** ターゲットグループは指定された `path` に定期的に問い合わせを行います。期待されるレスポンス（HTTP 200）が `healthy_threshold` 回連続で返ってきて初めて正常と判断され、トラフィックがルーティングされます。`unhealthy_threshold` 回失敗するとルーティング対象から除外されます。
- **リスナールールの優先順位 (`priority`):** ルールは数字の小さい順に評価されます。優先度 10 の `admin_allow` が優先度 20 の `admin_deny` より先に評価されるため、信頼できる IP からのリクエストは転送され、それ以外の `/admin/*` リクエストは固定の 403 応答になります。
- **`fixed-response` アクション:** バックエンドタスクにリクエストを転送することなく、ALB 自体が直接 HTTP レスポンス（403 など）を返します。
- **`internal = false`:** インターネット向けロードバランサーとして設定し、パブリックサブネット内で名前解決可能なパブリック DNS を割り当てます。

![ALB アーキテクチャ](https://ik.imagekit.io/kinn/my%20assets/alb1.png)
![ALB ルール設定](https://ik.imagekit.io/kinn/my%20assets/alb2.png)
