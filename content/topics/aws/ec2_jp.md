# コンピュートとオブジェクトストレージ (EC2 & S3)

---

## 概念

- **Amazon EC2 (Elastic Compute Cloud):** クラウド上の仮想サーバーです。アプリケーションの CPU とメモリを提供する基盤と考えられます。サブネット内に直接デプロイされます。
- **Amazon EBS (Elastic Block Store):** EC2 インスタンスに物理的に接続される高性能な仮想ハードディスクです。**ブロックストレージ** であり、OS やデータベースの実行に適しています。EBS ボリュームは、接続先の EC2 インスタンスと*まったく同じアベイラビリティゾーン (AZ)* に存在する必要があります。
- **Amazon S3 (Simple Storage Service):** **オブジェクトストレージ** です。EBS とは異なり、サーバーに接続するハードディスクではありません。ネットワーク（HTTP/API）経由でアクセスする巨大なサーバーレスのファイル保管庫です。バックアップ、ユーザーのアップロードファイル、静的 Web サイトファイルの保存に最適です。S3 バケットはリージョン単位のリソースであり、特定のサブネットや VPC 内には属しません。

---

### 設定例

```hcl
# プライベートサブネットにEC2インスタンスを作成し、データ保存用のEBSボリュームをアタッチする。
# また、ライフサイクルルール付きのバックアップ用S3バケットを設定する。

# 1. 最新の Amazon Linux 2023 AMI（OSイメージ）を検索
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }
}

# 2. プライベートサブネットへのEC2インスタンスのデプロイ
resource "aws_instance" "app_server" {
  ami           = data.aws_ami.amazon_linux.id
  instance_type = "t3.micro"
  subnet_id     = aws_subnet.private_subnet.id # プライベートネットワーク内に安全に配置

  iam_instance_profile = aws_iam_instance_profile.app_server_profile.name

  tags = {
    Name = "Production-App-Server"
  }
}

# 3. データ保存用の追加EBSボリュームを作成
resource "aws_ebs_volume" "data_drive" {
  # ボリュームはEC2インスタンスと同じアベイラビリティゾーンに存在する必要があります
  availability_zone = aws_instance.app_server.availability_zone
  size              = 20 # 20 GB
  type              = "gp3" # 汎用SSD

  tags = {
    Name = "App-Data-Drive"
  }
}

# 4. EBSボリュームをEC2インスタンスにアタッチ
resource "aws_volume_attachment" "ebs_attach" {
  device_name = "/dev/sdh"
  volume_id   = aws_ebs_volume.data_drive.id
  instance_id = aws_instance.app_server.id
}

# 5. 長期バックアップ用のS3バケットを作成
resource "aws_s3_bucket" "app_backups" {
  bucket = "company-unique-backup-bucket-2026" # グローバルで一意の名前である必要があります！
}

# 6. ストレージコスト削減のためのライフサイクルルールを追加
resource "aws_s3_bucket_lifecycle_configuration" "backup_lifecycle" {
  bucket = aws_s3_bucket.app_backups.id

  rule {
    id     = "archive_old_backups"
    status = "Enabled"

    # 30日後に安価なGlacierストレージクラスへ自動移行
    transition {
      days          = 30
      storage_class = "GLACIER"
    }

    # 365日後にファイルを自動削除
    expiration {
      days = 365
    }
  }
}

# EC2用のIAMロールを作成
# 1. 信頼ポリシーの定義（誰がこのロールを引き受けられるか）
data "aws_iam_policy_document" "ec2_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

# 2. IAMロールの作成
resource "aws_iam_role" "app_server_role" {
  name               = "AppServerRole"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume_role.json
}

# 3. AWS管理ポリシー SSM をアタッチ（Session Manager による接続を許可）
resource "aws_iam_role_policy_attachment" "ssm_attach" {
  role       = aws_iam_role.app_server_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# 4. S3 Full Access をアタッチ（バックアップスクリプト等で利用）
resource "aws_iam_role_policy_attachment" "s3_attach" {
  role       = aws_iam_role.app_server_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess" # 注: 本番環境ではFullAccessではなく最小権限のポリシーを使用してください！
}

# 5. インスタンスプロファイルの作成（RoleとEC2を結びつける接着剤）
resource "aws_iam_instance_profile" "app_server_profile" {
  name = "AppServerProfile"
  role = aws_iam_role.app_server_role.name
}
```

**主なコードの解説:**

- `availability_zone`: EBS ボリューム作成時に `aws_instance.app_server.availability_zone` を参照している点に注目してください。これにより、サーバーと同じ物理データセンターにハードディスクが作成され、AWS のアーキテクチャ要件を満たします。
- `aws_s3_bucket_lifecycle_configuration`: コスト最適化 (FinOps) のための重要機能です。使われなくなった古いファイルを自動的にアーカイブ・削除し、無駄なストレージ料金の発生を防ぎます。
- `AmazonSSMManagedInstanceCore`: AWS Systems Manager Session Manager を通じて EC2 インスタンスに接続できるようにする管理ポリシーです。SSH ポートを開放したり SSH 鍵を管理したりすることなく、パブリック IP を持たないプライベートサブネット内のインスタンスにも安全にアクセスできます。
- **参考:** EC2 インスタンス内で EBS ボリュームをフォーマット・マウントするコマンド例:

```bash
# 現在のディスク構成を確認
lsblk
# 新しいディスクをフォーマット
sudo mkfs -t xfs /dev/nvme1n1
# /data ディレクトリを作成してマウント
sudo mkdir /data
sudo mount /dev/nvme1n1 /data
```
