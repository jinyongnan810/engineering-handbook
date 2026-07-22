# CloudWatch

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
