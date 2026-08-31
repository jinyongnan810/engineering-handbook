# CloudWatch

**Amazon CloudWatch** は AWS 標準のモニタリングおよび可観測性（オブザーバビリティ）サービスです。ほぼすべての AWS サービスから **メトリクス**（CPU 使用率やリクエスト数などの数値時系列データ）、**ログ**、**イベント** を収集し、それらに基づいた自動アクションを実行できます。

## アラーム (Alarms)

**CloudWatch アラーム** は、単一のメトリクス（または複数のメトリクスにわたる数式）を監視し、そのメトリクスが時間の経過とともにしきい値と比較してどう変化したかに応じて状態を遷移させます。アラームは「何かが起きた」と「それに対処する」を繋ぐ架け橋です。

### アラームの状態

アラームは常に以下の3つの状態のいずれか1つを取ります:

- **`OK`** — メトリクスが定義されたしきい値の範囲内にある。
- **`ALARM`** — メトリクスがしきい値を超過（違反）した。
- **`INSUFFICIENT_DATA`** — アラームが開始された直後、メトリクスが利用できない、または判定に十分なデータがない。

### アラームの定義要素

すべてのアラームは以下の主要な要素から構成されます:

- **メトリクス (Metric)** — `namespace`（例: `AWS/ECS`）、`metric_name`（例: `CPUUtilization`）、および特定のリソース（特定のクラスターやサービスなど）にスコープを絞る `dimensions` で識別されます。
- **統計 (Statistic) & 期間 (Period)** — 各 `period`（秒単位）ごとに生データをどのように集計するか（`Average`, `Sum`, `Maximum` など）。
- **しきい値 (Threshold) & 比較条件 (Comparison)** — 比較対象となる値（`threshold`）と比較演算子（`comparison_operator`、例: `GreaterThanThreshold`）。
- **評価期間 (Evaluation periods)** — 状態が `ALARM` に切り替わるまでに何回連続でしきい値を超過する必要があるか。これにより、一時的なスパイクによる過敏な反応を防ぎます。
- **データの欠落時の処理 (`treat_missing_data`)** — データポイントが存在しない場合の処理方法（`notBreaching`, `breaching`, `ignore`, `missing`）。

### アクション

アラームの状態が変化したときに、アクションをトリガーできます。最も一般的なパターンは **SNS トピック** への通知であり、そこからメール、Slack、PagerDuty、または Lambda 関数へと配信されます:

- **`alarm_actions`** — `ALARM` 状態に遷移したときに実行。
- **`ok_actions`** — `OK` 状態に回復したときに実行。
- **`insufficient_data_actions`** — `INSUFFICIENT_DATA` 状態に遷移したときに実行。

> **リージョンに関する注意:** アラームアクション（SNS トピックなど）は、アラームと**同じリージョン**に存在する必要があります。**請求メトリクス**（`AWS/Billing`）は **`us-east-1`** でのみ発行されるため、コストアラームとその SNS トピックは必ず `us-east-1` で作成する必要があります（以下の例で `us_east_1` プロバイダーエイリアスを使用しているのはそのためです）。

### 設定例

以下の例では、Slack 用の SNS トピックに通知する3つのアラームを定義しています:

1. **請求アラーム** — 月間の推定請求額が米ドルのしきい値を超えたときに発火（`us-east-1` で定義）。
2. **ECS CPU アラーム** — サービスの平均 CPU 使用率が2回連続で80%を超えたときに発火。
3. **ALB 5XX アラーム** — ロードバランサーが5分間に多数の `5XX` エラーを返したときに発火。

```hcl
# コスト、ECSサービスのヘルス、およびロードバランサー用のCloudWatchアラーム

# 請求メトリクスは us-east-1 でのみ発行されるため、そのリージョン用のプロバイダーエイリアスが必要です。
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

# プライマリリージョン (ap-northeast-1) のアラーム通知用SNSトピック
resource "aws_sns_topic" "slack_notify" {
  name = "kinn-slack-notify"
}

# 請求アラーム用の us-east-1 のSNSトピック（アラームアクションはアラームと同じリージョンにある必要があります）
resource "aws_sns_topic" "slack_notify_us_east_1" {
  provider = aws.us_east_1
  name     = "kinn-slack-notify"
}

# 1. コストアラーム: 月間の推定AWS利用料金がしきい値を超えたときに発火
# 注: 請求メトリクスは us-east-1 リージョンでのみ利用可能です。
resource "aws_cloudwatch_metric_alarm" "billing_alarm" {
  provider = aws.us_east_1

  alarm_name          = "estimated-charges-too-high"
  alarm_description   = "Estimated AWS charges exceeded 50 USD for the month"
  namespace           = "AWS/Billing"
  metric_name         = "EstimatedCharges"
  statistic           = "Maximum"
  period              = 21600 # 6時間（請求メトリクスは1日に数回更新されます）
  evaluation_periods  = 1
  threshold           = 50
  comparison_operator = "GreaterThanThreshold"
  treat_missing_data  = "notBreaching"

  alarm_actions = [aws_sns_topic.slack_notify_us_east_1.arn]
  ok_actions    = [aws_sns_topic.slack_notify_us_east_1.arn]

  dimensions = {
    Currency = "USD"
  }
}

# 2. ECSメトリクスアラーム: サービスのCPU使用率が高止まりしたときに発火
resource "aws_cloudwatch_metric_alarm" "ecs_cpu_high" {
  alarm_name          = "ecs-nginx-service-cpu-high"
  alarm_description   = "ECS nginx service average CPU utilization above 80%"
  namespace           = "AWS/ECS"
  metric_name         = "CPUUtilization"
  statistic           = "Average"
  period              = 300
  evaluation_periods  = 2
  threshold           = 80
  comparison_operator = "GreaterThanThreshold"
  treat_missing_data  = "notBreaching"

  alarm_actions = [aws_sns_topic.slack_notify.arn]
  ok_actions    = [aws_sns_topic.slack_notify.arn]

  dimensions = {
    ClusterName = aws_ecs_cluster.app_cluster.name
    ServiceName = aws_ecs_service.app_service.name
  }
}

# 3. ALBエラーアラーム: ロードバランサーが5XXエラーを多く返したときに発火
resource "aws_cloudwatch_metric_alarm" "alb_5xx_high" {
  alarm_name          = "alb-5xx-errors-high"
  alarm_description   = "Application Load Balancer returned more than 10 5XX errors in 5 minutes"
  namespace           = "AWS/ApplicationELB"
  metric_name         = "HTTPCode_ELB_5XX_Count"
  statistic           = "Sum"
  period              = 300
  evaluation_periods  = 1
  threshold           = 10
  alarm_actions = [aws_sns_topic.slack_notify.arn]
  ok_actions    = [aws_sns_topic.slack_notify.arn]

  comparison_operator = "GreaterThanThreshold"
  treat_missing_data  = "notBreaching"

  dimensions = {
    LoadBalancer = aws_lb.app_alb.arn_suffix
  }
}
```

![アラーム一覧](https://ik.imagekit.io/kinn/my%20assets/alarms.png)

### アラームを手動でトリガーする方法

```bash
aws cloudwatch set-alarm-state \
    --alarm-name "alb-5xx-errors-high" \
    --state-value ALARM \
    --state-reason "手動テスト実行" \
    --region ap-northeast-1

aws cloudwatch set-alarm-state \
    --alarm-name "alb-5xx-errors-high" \
    --state-value OK \
    --state-reason "アラーム解除" \
    --region ap-northeast-1
```

## サブスクリプションフィルター (Subscription Filters)

CloudWatch からログをリアルタイムに抽出し、Lambda、Kinesis、S3 などの他のサービスに転送するには、サブスクリプションフィルターを使用します。これにより、ログデータのリアルタイム処理や分析が可能になります。

### 設定例

**lambda_log_processor.py**: ログイベントを処理して S3 に書き込むシンプルな Lambda 関数。

```python
import base64
import gzip
import json
import os
from datetime import datetime, timezone

import boto3

BUCKET_NAME = os.environ["BUCKET_NAME"]
PREFIX = os.environ.get("PREFIX", "logs/")

s3 = boto3.client("s3")


def handler(event, context):
    """CloudWatch Logs サブスクリプションイベントを受信して S3 に保存する。

    サブスクリプションペイロードは Base64 エンコードおよび Gzip 圧縮された JSON です。
    """
    compressed = base64.b64decode(event["awslogs"]["data"])
    payload = json.loads(gzip.decompress(compressed))

    # サブスクリプション作成時に送信されるコントロールメッセージはスキップ
    if payload.get("messageType") == "CONTROL_MESSAGE":
        return

    now = datetime.now(timezone.utc)
    key = (
        f"{PREFIX}{payload['logGroup']}/{now:%Y/%m/%d}/"
        f"{payload['logStream']}-{now:%H%M%S%f}.json"
    )

    s3.put_object(
        Bucket=BUCKET_NAME,
        Key=key,
        Body=json.dumps(payload).encode("utf-8"),
    )
```

**terraform/main.tf**: Lambda サブスクリプションフィルターと S3 バケットを設定する Terraform 構成。

```hcl
# "SessionId" を含む Lambda の CloudWatch ログを S3 に転送する。
# Kinesis Firehose を使用しない構成のため、サブスクリプションフィルターから
# ログイベントをデコードして S3 に書き込む軽量なプロセッサ Lambda に転送します。
#
# 注: /aws/lambda/HelloWorldAPI は関数の初回実行時に AWS によって自動作成されます。
# apply 前にインポートしてください:
#   terraform import aws_cloudwatch_log_group.lambda_logs /aws/lambda/HelloWorldAPI

data "aws_caller_identity" "current" {}

# 1. フィルターを関連付けるために Lambda のロググループを管理
resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${aws_lambda_function.hello_world_function.function_name}"
  retention_in_days = 14
}

# 2. エクスポートされたログの送信先 S3 バケット
resource "aws_s3_bucket" "lambda_logs" {
  bucket = "lambda-logs-${data.aws_caller_identity.current.account_id}"
}

resource "aws_s3_bucket_public_access_block" "lambda_logs" {
  bucket                  = aws_s3_bucket.lambda_logs.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# 3. フィルターされたログイベントをバケットに書き込むプロセッサ Lambda
data "archive_file" "log_processor_zip" {
  type        = "zip"
  source_file = "log_processor.py"
  output_path = "log_processor.zip"
}

data "aws_iam_policy_document" "log_processor_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "log_processor_exec_role" {
  name               = "LambdaLogProcessorRole"
  assume_role_policy = data.aws_iam_policy_document.log_processor_assume_role.json
}

resource "aws_iam_role_policy_attachment" "log_processor_logs_attach" {
  role       = aws_iam_role.log_processor_exec_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

data "aws_iam_policy_document" "log_processor_s3" {
  statement {
    actions   = ["s3:PutObject"]
    resources = ["${aws_s3_bucket.lambda_logs.arn}/*"]
  }
}

resource "aws_iam_role_policy" "log_processor_s3" {
  name   = "LambdaLogProcessorS3Write"
  role   = aws_iam_role.log_processor_exec_role.id
  policy = data.aws_iam_policy_document.log_processor_s3.json
}

resource "aws_lambda_function" "log_processor" {
  function_name    = "HelloWorldLogProcessor"
  filename         = data.archive_file.log_processor_zip.output_path
  role             = aws_iam_role.log_processor_exec_role.arn
  handler          = "log_processor.handler"
  runtime          = "python3.12"
  source_code_hash = data.archive_file.log_processor_zip.output_base64sha256

  environment {
    variables = {
      BUCKET_NAME = aws_s3_bucket.lambda_logs.id
      PREFIX      = "logs/"
    }
  }
}

# 4. CloudWatch Logs からプロセッサ Lambda を呼び出す権限を付与
resource "aws_lambda_permission" "allow_cloudwatch_logs" {
  statement_id  = "AllowCloudWatchLogsInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.log_processor.function_name
  principal     = "logs.amazonaws.com"
  source_arn    = "${aws_cloudwatch_log_group.lambda_logs.arn}:*"
}

# 5. "SessionId" を含むログレコードのみを転送するサブスクリプションフィルター
resource "aws_cloudwatch_log_subscription_filter" "session_id" {
  name            = "SessionIdToS3"
  log_group_name  = aws_cloudwatch_log_group.lambda_logs.name
  filter_pattern  = "SessionId"
  destination_arn = aws_lambda_function.log_processor.arn

  depends_on = [aws_lambda_permission.allow_cloudwatch_logs]
}
```

![サブスクリプションフィルター](https://ik.imagekit.io/kinn/my%20assets/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202026-07-22%2016.02.54.png)
