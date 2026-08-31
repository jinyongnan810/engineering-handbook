# AWS ネットワークの基礎（Networking）

## VPC (Virtual Private Cloud)

データベースや Web サーバーをデプロイする前に、それらが配置される安全なネットワーク空間が必要です。AWS ではこれを **VPC (Virtual Private Cloud)** と呼びます。VPC は、AWS クラウド上に論理的に分離された自分専用の仮想ネットワークです。

VPC 内では、ネットワークを **サブネット (Subnet)** と呼ばれる小さな区画に分割します:

- **パブリックサブネット (Public Subnets)**: インターネットゲートウェイ (IGW) を介して外部インターネットへの直接ルートを持ちます。ロードバランサーや踏み台サーバーなどの公開リソースを配置します。
- **プライベートサブネット (Private Subnets)**: インターネットへの直接ルートを持ちません。アプリケーションサーバーやデータベースなどの機密性の高いバックエンドリソースを安全に配置します。

サブネット間やインターネットへのトラフィックの流れを制御するために **ルートテーブル (Route Tables)** を使用します。ルートテーブルは、ネットワークパケットがどこに向かうべきかを指示する交通整理のルール集です。

### 設定例

```hcl
# AWS 内に VPC と2つのサブネット（パブリック1つ、プライベート1つ）を作成する構成

# 1. VPC の作成
resource "aws_vpc" "main_vpc" {
  cidr_block           = "10.0.0.0/16" # 最大 65,536 個の IP アドレスを提供
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "Production-VPC"
  }
}

# 2. インターネットゲートウェイの作成（外界への玄関口）
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main_vpc.id

  tags = {
    Name = "Production-IGW"
  }
}

# 3. パブリックサブネットの作成
resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.main_vpc.id
  cidr_block              = "10.0.1.0/24" # 256 個の IP
  map_public_ip_on_launch = true          # ここに起動するインスタンスに自動でパブリック IP を割り当て

  tags = {
    Name = "Public-Subnet-1"
  }
}

# 4. パブリックサブネット用のルートテーブルを作成
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.main_vpc.id

  # すべてのアウトバウンドトラフィック (0.0.0.0/0) をインターネットゲートウェイに向ける
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
}

# 5. ルートテーブルをパブリックサブネットに関連付け
resource "aws_route_table_association" "public_assoc" {
  subnet_id      = aws_subnet.public_subnet.id
  route_table_id = aws_route_table.public_rt.id
}

# 6. プライベートサブネットの作成（IGW への直接ルートを持たない）
resource "aws_subnet" "private_subnet" {
  vpc_id     = aws_vpc.main_vpc.id
  cidr_block = "10.0.2.0/24"

  tags = {
    Name = "Private-Subnet-1"
  }
}
```

## NAT ゲートウェイと Elastic IP

プライベートサブネット内のデータベースを外部から直接アクセスさせずに、セキュリティパッチのダウンロードなど外部へのアウトバウンド通信のみを許可したい場合、**NAT (Network Address Translation) ゲートウェイ** を使用します。

- **仕組み**: NAT ゲートウェイはパブリックサブネット内に配置されます。プライベートサブネット内のリソースがインターネットへ発信するアウトバウンド接続（ソフトウェア更新など）を中継しつつ、外部インターネットからのインバウンド接続は完全に遮断します（マジックミラーのような役割を果たします）。
- **Elastic IP (EIP)**: NAT ゲートウェイがインターネットと通信するために必要な、固定のパブリック IPv4 アドレスです。
- **プライベート用ルートテーブル**: パブリックサブネットと同様に、プライベートサブネットに対してもトラフィックのルーティングを明示的に設定します。アウトバウンドトラフィック (`0.0.0.0/0`) を NAT ゲートウェイに向けるルートテーブルを作成して関連付けます。

### 設定例

```hcl
# プライベートサブネットがパブリックサブネット経由でインターネットにアクセスするための NAT ゲートウェイ設定

# 1. NAT ゲートウェイ用の Elastic IP を割り当て
resource "aws_eip" "nat_eip" {
  domain = "vpc"

  tags = {
    Name = "Production-NAT-EIP"
  }
}

# 2. NAT ゲートウェイの作成（必ず パブリック サブネットに配置！）
resource "aws_nat_gateway" "nat_gw" {
  allocation_id = aws_eip.nat_eip.id
  subnet_id     = aws_subnet.public_subnet.id # パブリックサブネット内に配置

  tags = {
    Name = "Production-NAT-GW"
  }

  # ベストプラクティス: IGW が作成されてから NAT ゲートウェイを作成
  depends_on = [aws_internet_gateway.igw]
}

# 3. プライベートサブネット専用のルートテーブルを作成
resource "aws_route_table" "private_rt" {
  vpc_id = aws_vpc.main_vpc.id

  # すべてのアウトバウンドトラフィックを NAT ゲートウェイに向ける
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat_gw.id
  }

  tags = {
    Name = "Private-Route-Table"
  }
}

# 4. ルートテーブルをプライベートサブネットに関連付け
resource "aws_route_table_association" "private_assoc" {
  subnet_id      = aws_subnet.private_subnet.id
  route_table_id = aws_route_table.private_rt.id
}
```

![VPC 構成図](https://ik.imagekit.io/kinn/my%20assets/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202026-07-19%2010.40.48.png)
