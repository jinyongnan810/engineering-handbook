# マネージドデータベース (Amazon RDS PostgreSQL & DynamoDB)

---

## リレーショナルデータベース vs サーバーレス NoSQL

アプリケーションデータを永続化する必要がある場合、AWS には主に2つの選択肢があり、クラウド上での動作形態が大きく異なります:

- **Amazon RDS (Relational Database Service):** 従来のリレーショナル SQL データベース（PostgreSQL、MySQL、Oracle など）向け。RDS はデータベースエンジンを実行するための基礎となる EC2 インスタンスを内部でプロビジョニングします。サーバー上で動作するため、セキュリティを確保するために RDS インスタンスは **VPC 内（具体的にはプライベートサブネット）に配置する必要があります**。
- **Amazon DynamoDB:** AWS ネイティブのサーバーレス NoSQL データベース。データをキー・バリュー形式（JSON 風ドキュメント）で保存し、1桁ミリ秒のレイテンシで大規模なスケールに対応できるように設計されています。RDS とは異なり、DynamoDB は **サーバーレスであり VPC の完全に外部に存在します**。インターネット経由で AWS API を通じてアクセスし、ネットワークファイアウォールではなく IAM ポリシーによってアクセス制御を行います。

### 設定例

```hcl
# RDS PostgreSQL インスタンス1台と DynamoDB テーブル1つを作成する構成
# ---------------------------------------------------------
# 1. RDS POSTGRESQL (リレーショナル、VPC 内部)
# ---------------------------------------------------------

# DB サブネットグループの作成（RDS が配置されるサブネットを指定）
resource "aws_db_subnet_group" "db_subnet" {
  name       = "main_db_subnet_group"
  # セキュリティのためプライベートサブネットに配置
  subnet_ids = [
    aws_subnet.private_subnet.id,
    aws_subnet.private_subnet_2.id
  ]

  tags = {
    Name = "Main DB Subnet Group"
  }
}

# RDS PostgreSQL インスタンスのプロビジョニング
resource "aws_db_instance" "postgres_db" {
  identifier             = "production-postgres"
  engine                 = "postgres"
  engine_version         = "18.4"
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  username               = "dbadmin"
  password               = "SuperSecretPassword123!" # 注: 本番環境では AWS Secrets Manager を使用してください！
  db_subnet_group_name   = aws_db_subnet_group.db_subnet.name
  skip_final_snapshot    = true # 本番環境では削除時にバックアップを残すため false に設定します
}

# ---------------------------------------------------------
# 2. DYNAMODB (サーバーレス、NoSQL、IAM 認証)
# ---------------------------------------------------------

# ユーザーセッション用のサーバーレス DynamoDB テーブル
resource "aws_dynamodb_table" "user_sessions" {
  name         = "UserSessions"
  billing_mode = "PAY_PER_REQUEST" # サーバーレスのオンデマンド従量課金
  hash_key     = "SessionId"       # プライマリキー

  attribute {
    name = "SessionId"
    type = "S" # "S" は文字列 (String) を表します
  }

  tags = {
    Environment = "Production"
  }
}
```

**主なコードの解説:**

- `db_subnet_group_name`: RDS インスタンスは高可用性を担保するために複数サブネットにまたがって構成されます。プライベートサブネットの ID をグループとして明示的に渡し、データベースに割り当てる必要があります（1つのサブネットだけではエラーになります）。
- `skip_final_snapshot`: デフォルトでは、Terraform による誤削除時に自動で最終スナップショットが作成されます。ここではサンドボックス環境をクリーンに破棄できるように `true` に設定しています。
- `PAY_PER_REQUEST`: DynamoDB テーブルに必要な読み書きキャパシティを事前に予測して 24時間常時費用を支払う代わりに、AWS が即座に自動スケーリングし、実際に使用した分だけ課金される設定です。
