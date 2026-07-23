# CloudWatch

**Amazon CloudWatch** is AWS's built-in monitoring and observability service. It collects **metrics** (numeric time-series data such as CPU utilization or request counts), **logs**, and **events** from nearly every AWS service, and lets you react to them automatically.

## Alarms

A **CloudWatch Alarm** watches a single metric (or a math expression over several metrics) and changes state based on how that metric compares to a threshold over time. Alarms are the bridge between "something happened" and "do something about it."

### Alarm states

An alarm is always in exactly one of three states:

- **`OK`** — the metric is within the defined threshold.
- **`ALARM`** — the metric has breached the threshold.
- **`INSUFFICIENT_DATA`** — the alarm has just started, the metric isn't available, or there isn't enough data to decide.

### How an alarm is defined

Every alarm is built from a few core pieces:

- **Metric** — identified by a `namespace` (e.g. `AWS/ECS`), a `metric_name` (e.g. `CPUUtilization`), and `dimensions` that scope it to a specific resource (e.g. a particular cluster and service).
- **Statistic & period** — how raw datapoints are aggregated (`Average`, `Sum`, `Maximum`, …) over each `period` (in seconds).
- **Threshold & comparison** — the value to compare against (`threshold`) and the `comparison_operator` (e.g. `GreaterThanThreshold`).
- **Evaluation periods** — how many consecutive periods must breach before the state flips to `ALARM`. This avoids reacting to a single transient spike.
- **`treat_missing_data`** — what to do when datapoints are absent (`notBreaching`, `breaching`, `ignore`, `missing`).

### Actions

When an alarm transitions, it can trigger actions. The most common pattern is publishing to an **SNS topic**, which then fans out to email, Slack, PagerDuty, or a Lambda function:

- **`alarm_actions`** — run when entering the `ALARM` state.
- **`ok_actions`** — run when recovering back to `OK`.
- **`insufficient_data_actions`** — run when entering `INSUFFICIENT_DATA`.

> **Region note:** Alarm actions (e.g. the SNS topic) must live in the **same region** as the alarm. **Billing metrics** (`AWS/Billing`) are only published in **`us-east-1`**, so cost alarms and their SNS topics must be created there — this is why the example below uses a `us_east_1` provider alias.

### Example

The example below defines three alarms, each notifying a Slack SNS topic:

1. **Billing alarm** — fires when estimated monthly charges exceed a USD threshold (defined in `us-east-1`).
2. **ECS CPU alarm** — fires when a service's average CPU utilization stays above 80% for two consecutive periods.
3. **ALB 5XX alarm** — fires when the load balancer returns too many `5XX` errors in a 5-minute window.

```hcl
# CloudWatch alarms for cost, ECS service health, and the load balancer.

# Billing metrics are only published in us-east-1, so we need a provider alias there.
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

# SNS topic for alarm notifications in the primary region (ap-northeast-1).
resource "aws_sns_topic" "slack_notify" {
  name = "kinn-slack-notify"
}

# SNS topic in us-east-1 for the billing alarm (alarm actions must be in the
# same region as the alarm).
resource "aws_sns_topic" "slack_notify_us_east_1" {
  provider = aws.us_east_1
  name     = "kinn-slack-notify"
}

# 1. Cost alarm: fires when the estimated monthly AWS charges exceed the threshold.
# Note: Billing metrics are only available in the us-east-1 region.
resource "aws_cloudwatch_metric_alarm" "billing_alarm" {
  provider = aws.us_east_1

  alarm_name          = "estimated-charges-too-high"
  alarm_description   = "Estimated AWS charges exceeded 50 USD for the month"
  namespace           = "AWS/Billing"
  metric_name         = "EstimatedCharges"
  statistic           = "Maximum"
  period              = 21600 # 6 hours (billing metrics update a few times a day)
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

# 2. ECS metric alarm: fires when the service's CPU utilization stays high.
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

# 3. Common alarm: fires when the load balancer returns too many 5XX errors.
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

![Alarms](https://ik.imagekit.io/kinn/my%20assets/alarms.png)

### To manually trigger an alarm

```bash
aws cloudwatch set-alarm-state \
    --alarm-name "alb-5xx-errors-high" \
    --state-value ALARM \
    --state-reason "Manual trigger test" \
    --region ap-northeast-1

aws cloudwatch set-alarm-state \
    --alarm-name "alb-5xx-errors-high" \
    --state-value OK \
    --state-reason "Clear alarm" \
    --region ap-northeast-1
```

## Subscription Filters

To extract logs from CloudWatch, one can use subscription filters to send log data to other services like Lambda, Kinesis, or S3. This allows for real-time processing and analysis of log data.

### Example

**lambda_log_processor.py**: A simple Lambda function that processes log events and writes them to S3.

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
    """Receive a CloudWatch Logs subscription event and store it in S3.

    The subscription payload is base64-encoded, gzip-compressed JSON.
    """
    compressed = base64.b64decode(event["awslogs"]["data"])
    payload = json.loads(gzip.decompress(compressed))

    # Control messages are sent when a subscription is first created; skip them.
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

**terraform/main.tf**: Terraform configuration for setting up the Lambda subscription filter and S3 bucket.

```hcl
# Ship Lambda CloudWatch logs matching "SessionId" to S3.
# Since my account cannot use Kinesis Firehose, the subscription filter targets a
# small processor Lambda that decodes the log events and writes them to S3.
#
# NOTE: /aws/lambda/HelloWorldAPI is auto-created by AWS the first time the
# function runs. Import it before applying:
#   terraform import aws_cloudwatch_log_group.lambda_logs /aws/lambda/HelloWorldAPI

data "aws_caller_identity" "current" {}

# 1. Manage the Lambda's log group so a filter can be attached to it
resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${aws_lambda_function.hello_world_function.function_name}"
  retention_in_days = 14
}

# 2. Destination S3 bucket for the exported logs
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

# 3. Processor Lambda that writes filtered log events into the bucket
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

# 4. Allow CloudWatch Logs to invoke the processor Lambda
resource "aws_lambda_permission" "allow_cloudwatch_logs" {
  statement_id  = "AllowCloudWatchLogsInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.log_processor.function_name
  principal     = "logs.amazonaws.com"
  source_arn    = "${aws_cloudwatch_log_group.lambda_logs.arn}:*"
}

# 5. Subscription filter forwarding only records containing "SessionId"
resource "aws_cloudwatch_log_subscription_filter" "session_id" {
  name            = "SessionIdToS3"
  log_group_name  = aws_cloudwatch_log_group.lambda_logs.name
  filter_pattern  = "SessionId"
  destination_arn = aws_lambda_function.log_processor.arn

  depends_on = [aws_lambda_permission.allow_cloudwatch_logs]
}
```

![Subcription Filter](https://ik.imagekit.io/kinn/my%20assets/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202026-07-22%2016.02.54.png)
