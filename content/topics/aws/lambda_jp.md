# Lambda

**AWS Lambda** はコンピュートのあり方を根本から変えるサービスです。真のサーバーレス・コンピュート基盤であり、コード（Python、Node.js、Go など）をアップロードするかコンテナイメージを指定するだけで、AWS が基盤インフラのすべてを管理します。

サーバーをプロビジョニングし、同時に10,000件のリクエストが来れば即座に自動スケーリングし、コードの実行が終了すればリソースを自動破棄します。課金はコードが実行されたミリ秒単位のみ発生します。

ただし、Terraform 経由で Lambda をデプロイする際には2つの固有の課題があります:

1. **デプロイパッケージ:** AWS Lambda にコードをアップロードするには、コードを `.zip` ファイルに圧縮する必要があります。Terraform はこの zip 圧縮プロセスを自動処理する必要があります。
2. **実行ロール (Execution Role):** EC2 インスタンスが S3 や DynamoDB にアクセスするためにロールを必要とするのと同様に、Lambda 関数には IAM 実行ロールが必要です。最低限、自身の実行ログを Amazon CloudWatch に書き込む権限が必要です。

---

## 設定例

```hcl
# DynamoDB テーブルの読み書きを行う Lambda 関数のデプロイ

# 1. ローカルの Python コードを zip 圧縮（Terraform が自動実行）
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = "index.py"            # ローカルのソースコードファイル
  output_path = "lambda_function.zip" # Terraformが生成する出力zipファイル
}

# 2. 信頼関係の作成（誰がこのロールを引き受けられるか）
data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"] # Lambda サービスを信頼
    }
  }
}

# 3. 実行ロールの作成
resource "aws_iam_role" "lambda_exec_role" {
  name               = "LambdaBasicExecutionRole"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

# 4. 基本実行用のAWS管理ポリシーをアタッチ（CloudWatchへのログ記録を許可）
resource "aws_iam_role_policy_attachment" "lambda_logs_attach" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# 5. DynamoDB テーブルへの読み書き権限を付与
data "aws_iam_policy_document" "lambda_dynamodb" {
  statement {
    actions = [
      "dynamodb:GetItem",
      "dynamodb:BatchGetItem",
      "dynamodb:Query",
      "dynamodb:PutItem",
      "dynamodb:UpdateItem",
      "dynamodb:DeleteItem",
      "dynamodb:BatchWriteItem",
    ]
    resources = [
      aws_dynamodb_table.user_sessions.arn,
      "${aws_dynamodb_table.user_sessions.arn}/index/*",
    ]
  }
}

resource "aws_iam_role_policy" "lambda_dynamodb" {
  name   = "LambdaDynamoDBReadWrite"
  role   = aws_iam_role.lambda_exec_role.id
  policy = data.aws_iam_policy_document.lambda_dynamodb.json
}

# 6. Lambda 関数のデプロイ
resource "aws_lambda_function" "hello_world_function" {
  function_name = "HelloWorldAPI"
  filename      = data.archive_file.lambda_zip.output_path
  role          = aws_iam_role.lambda_exec_role.arn
  handler       = "index.handler" # index.py 内の handler という関数を実行するよう指示
  runtime       = "python3.12"

  memory_size = 256 # MB
  timeout     = 60  # 秒

  # コード変更ごとに新しい不変バージョンを発行
  publish = true

  # Python コードが実際に変更された場合のみ関数を更新するハッシュ値
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.user_sessions.name
    }
  }
}

# 7. 最新の公開バージョンを指すエイリアス
resource "aws_lambda_alias" "current" {
  name             = "current"
  function_name    = aws_lambda_function.hello_world_function.function_name
  function_version = aws_lambda_function.hello_world_function.version
}
```

**主なコードの解説:**

- `data "archive_file"`: `terraform apply` 実行時にオンデマンドでコードを自動 zip 圧縮する組み込みプロバイダーです。
- `AWSLambdaBasicExecutionRole`: Lambda が CloudWatch にログを出力するために必要な最小限の権限を提供する AWS 管理ポリシーです。
- `handler`: ファイル名が `index.py` で関数が `def lambda_handler(event, context):` の場合、ハンドラーは `index.lambda_handler` になります。
- `source_code_hash`: zip ファイルの暗号学的ハッシュを生成します。Python コードが1行でも変更されるとハッシュ値が変わり、Terraform が新しいバージョンをアップロードする必要があると検知します。
- `aws_lambda_alias`: Lambda 関数の最新公開バージョンを指すポインタです。複数バージョンの切り替えを安全に行うことができます。

# Lambda 関数の呼び出し方法 (Invocation)

Lambda 関数をトリガー・呼び出す方法は多岐にわたります:

- **マネジメントコンソールでのテスト**: サンプルイベントペイロードを指定して「テスト」ボタンを押すことで直接実行できます。動作確認やデバッグに最適です。
- **API Gateway**: API Gateway を前段に配置して RESTful API エンドポイントとして公開します。クライアントからの HTTP リクエスト経由で実行でき、サーバーレス Web アプリのバックエンドに適しています。
- **EventBridge**: 特定のイベントやスケジュール（Cron）に基づいて定期実行します。タスクの自動化やシステム連携に便利です。
- **イベントソースマッピング (Event Source Mapping)**: S3（ファイル保存時）、DynamoDB（Streams）、Kinesis などのイベントをトリガーとして自動実行します。

## 設定例

```hcl
# EventBridge スケジューラーを使用して東京時間の毎週月曜朝 08:00 に HelloWorldAPI を実行

# 1. EventBridge スケジューラーがロールを引き受けるための信頼関係
data "aws_iam_policy_document" "scheduler_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["scheduler.amazonaws.com"]
    }
  }
}

# 2. スケジューラーが Lambda を呼び出すために使用するロール
resource "aws_iam_role" "scheduler_exec_role" {
  name               = "HelloWorldSchedulerRole"
  assume_role_policy = data.aws_iam_policy_document.scheduler_assume_role.json
}

# 3. 特定の Lambda エイリアスを呼び出す権限
data "aws_iam_policy_document" "scheduler_invoke_lambda" {
  statement {
    actions   = ["lambda:InvokeFunction"]
    resources = [aws_lambda_alias.current.arn]
  }
}

resource "aws_iam_role_policy" "scheduler_invoke_lambda" {
  name   = "HelloWorldSchedulerInvokeLambda"
  role   = aws_iam_role.scheduler_exec_role.id
  policy = data.aws_iam_policy_document.scheduler_invoke_lambda.json
}

# 4. 毎週の定期実行スケジュール（東京時間の毎週月曜 08:00）
resource "aws_scheduler_schedule" "hello_world_weekly" {
  name = "HelloWorldWeeklyMonday"

  flexible_time_window {
    mode = "OFF"
  }

  schedule_expression          = "cron(0 8 ? * MON *)"
  schedule_expression_timezone = "Asia/Tokyo"

  target {
    arn      = aws_lambda_alias.current.arn
    role_arn = aws_iam_role.scheduler_exec_role.arn

    input = jsonencode({
      action    = "read"
      SessionId = "abc123"
    })
  }
}
```

**主なコードの解説:**

- `aws_scheduler_schedule`: 東京時間の毎週月曜 08:00 に Lambda を起動するスケジュールを作成します。`schedule_expression` に標準の cron 式を指定します。
- `aws_iam_role`: EventBridge Scheduler がロールを引き受けて Lambda を実行できるようにします。
- `aws_iam_role_policy`: スケジューラーが特定の Lambda エイリアス ARN に対して `lambda:InvokeFunction` を実行できる権限を付与します。
