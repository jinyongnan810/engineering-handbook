# IAM (Identity and Access Management)

AWS において、**IAM (Identity and Access Management)** はセキュリティの絶対的な基礎です——誰が（あるいは何が）クラウド上のリソースにアクセスできるかを厳密に制御します。

## AWS IAM の構成要素

AWS IAM はリソースへのアクセスを制御するために4つの主要な柱に基づいています。AWS 環境を安全に構築するためには、これらがどのように相互作用するかを理解する必要があります:

- **ユーザー (Users):** 長期的な認証情報を必要とする個人またはアプリケーション。
- **グループ (Groups):** 同一の権限レベルを共有するユーザーの集合。
- **ロール (Roles):** ユーザー、アプリケーション、または AWS サービス（S3 バケットにアクセスする必要がある EC2 インスタンスなど）が一時的に引き受けるアイデンティティ。
- **ポリシー (Policies):** 特定のリソースに対してどのアクションを許可または拒否するかを明示的に定義する JSON ドキュメント。

### ロールとポリシーの関係性

AWS セキュリティにおける「誰が (Who)」と「何を (What)」の古典的な関係として捉えることができます。

- **ポリシー（「何を」/ The "What"）:** ルールを明示的に定義する JSON ドキュメントです。具体的には、どの AWS リソースに対してどのアクションを許可または拒否するかを規定します。単体では、ポリシーは適用されるのを待っている権限リストにすぎません。
- **ロール（「誰が・何が」/ The "Who/What"）:** ユーザー、アプリケーション、または AWS サービス（S3 バケットと通信する必要がある EC2 など）が引き受けるための一時的なアイデンティティです。単体では、空のロールには一切の権限がありません。

#### 双方がどのように連携するか

ロールに実際の権限を与えるには、ポリシーをロールに **アタッチ (関連付け)** する必要があります。

- **ポリシー** は、実行可能な操作（および実行不可能な操作）の境界を決定します。
- **ロール** は、サービスがその権限を引き継ぐために「身にまとう」一時的なアイデンティティとして機能します。

アイデンティティ（ロール）と権限（ポリシー）を分離することで、AWS ではハードコードされたアクセスキーや長期的な認証情報を管理することなく、リソースに安全な一時的アクセス権を委譲できます。

#### 具体的なコード例

**例: 読み取り専用 IAM ユーザーの作成とポリシーのアタッチ**
この構成では、IAM ユーザーを作成し、AWS 管理ポリシーである `ReadOnlyAccess` をアタッチします。

```hcl
// main.tf

// read_only_user という名前の aws_iam_user リソースを宣言
// これにより AWS 内に IAM ユーザーが作成されます
resource "aws_iam_user" "read_only_user" {
  name = "app-reader"
  tags = {
    Environment = "Production"
  }
}

// 管理ポリシーをユーザーにアタッチするリソース
resource "aws_iam_user_policy_attachment" "reader_attach" {
  user       = aws_iam_user.read_only_user.name
  policy_arn = "arn:aws:iam::aws:policy/ReadOnlyAccess"
}

# ポリシードキュメントの定義（「何を許可するか」）
data "aws_iam_policy_document" "s3_upload_doc" {
  statement {
    effect  = "Allow"
    actions = [
      "s3:PutObject"
    ]
    resources = [
      "arn:aws:s3:::company-upload-bucket/*"
    ]
  }
}

# IAM ポリシーリソースの作成
resource "aws_iam_policy" "s3_upload_policy" {
  name        = "S3UploadOnlyPolicy"
  description = "company-upload-bucket へのオブジェクト書き込みを許可"
  policy      = data.aws_iam_policy_document.s3_upload_doc.json
}

# 作成したポリシーを既存のユーザーにアタッチ（「誰に」）
resource "aws_iam_user_policy_attachment" "app_reader_s3_attach" {
  user       = aws_iam_user.read_only_user.name
  policy_arn = aws_iam_policy.s3_upload_policy.arn
}
```

### IAM ロールと信頼関係 (Trust Relationships)

ロールは、ユーザー、アプリケーション、または AWS サービスが一時的に引き受けることができるアイデンティティです。IAM ユーザーとは異なり、ロールは恒久的な認証情報（パスワードやアクセスキー）を持ちません。
誰でも勝手にロールを引き受けられないようにするため、IAM ロールが機能するには2つの異なるポリシーが必要です:

- **アクセス許可ポリシー (Permissions Policy)**: そのロールに何が許可されているか（先ほど作成した S3 アップロードポリシーなど）。
- **信頼関係ポリシー (Trust Relationship / Assume Role Policy)**: そもそも「誰（どのサービス）がそのロールを引き受けることが許可されているか」を規定する特別なポリシー。

例えば、EC2 インスタンス（仮想サーバー）が S3 バケットにファイルを書き込む必要がある場合、サーバー内にパスワードをハードコードしません。代わりにロールを作成し、EC2 サービスがそのロールを引き受けることを信頼し、S3 へのアクセス権限ポリシーをアタッチします。

#### 具体的な設定例

```hcl
# 例: EC2 インスタンスが S3 にアクセスするための IAM ロールの作成

# 信頼ポリシーの定義（「誰がこのロールを引き受けることを許可されているか」）
data "aws_iam_policy_document" "ec2_trust_policy" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"] # ロールを引き受けるための特定のAPI呼び出し

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"] # AWS EC2 サービスを信頼
    }
  }
}

# IAM ロールの作成
resource "aws_iam_role" "app_server_role" {
  name               = "AppServerRole"
  assume_role_policy = data.aws_iam_policy_document.ec2_trust_policy.json
}

# 既存のカスタムポリシーを新しいロールにアタッチ
resource "aws_iam_role_policy_attachment" "role_s3_attach" {
  role       = aws_iam_role.app_server_role.name
  policy_arn = aws_iam_policy.s3_upload_policy.arn
}
```
