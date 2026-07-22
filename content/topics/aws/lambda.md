# Lambda

**AWS Lambda** changes everything. It is a true serverless compute service. One simply uploads the code (Python, Node.js, Go, etc.) or specifies images, and AWS handles 100% of the underlying infrastructure.

It provisions the servers, scales them instantly if 10,000 requests hit at once, and destroys them when the code finishes running. It's billed billed purely by the millisecond the code is executing.

However, deploying Lambda via Terraform introduces two unique challenges:

1. **Deployment Packages:** AWS Lambda requires the code to be compressed into a `.zip` file before it can be uploaded. Terraform needs to handle this zipping process automatically.
2. **The Execution Role:** Just like an EC2 instance needs a role to access S3/DynamoDB, a Lambda function needs an IAM Execution Role. At a bare minimum, it needs permission to write its own logs to Amazon CloudWatch.

---

## Example

```hcl
# Deploy a Lambda function that can read/write to a DynamoDB table
# 1. Zip the local Python code (Terraform handles this automatically!)
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = "index.py"            # The local file the code was written in
  output_path = "lambda_function.zip" # The output zip file Terraform creates
}

# 2. Create the Trust Relationship (Who can assume this role?)
data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"] # We trust the Lambda service
    }
  }
}

# 3. Create the Execution Role
resource "aws_iam_role" "lambda_exec_role" {
  name               = "LambdaBasicExecutionRole"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

# 4. Attach the AWS-managed policy for basic execution (Allows CloudWatch logging)
resource "aws_iam_role_policy_attachment" "lambda_logs_attach" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# 5. Grant read/write access to the DynamoDB table
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

# 6. Deploy the Lambda Function
resource "aws_lambda_function" "hello_world_function" {
  function_name = "HelloWorldAPI"
  filename      = data.archive_file.lambda_zip.output_path
  role          = aws_iam_role.lambda_exec_role.arn
  handler       = "index.handler" # Tells AWS: Look in index.py for a function named handler
  runtime       = "python3.12"

  memory_size = 256 # MB
  timeout     = 60  # seconds

  # Publish a new immutable version each time the code changes
  publish = true

  # This hash tells Terraform to update the function ONLY if the Python code actually changes!
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.user_sessions.name
    }
  }
}

# 7. Alias pointing at the latest published version
resource "aws_lambda_alias" "current" {
  name             = "current"
  function_name    = aws_lambda_function.hello_world_function.function_name
  function_version = aws_lambda_function.hello_world_function.version
}

```

**Key Code Breakdown:**

- `data "archive_file"`: This is a built-in Terraform provider that zips the code on the fly during `terraform apply`.
- `AWSLambdaBasicExecutionRole`: This is an AWS-managed policy specifically designed to give Lambda the exact permissions it needs to write logs to CloudWatch.
- `handler`: If the file is named `index.py` and the main function inside it is `def lambda_handler(event, context):`, the handler is `index.lambda_handler`.
- `source_code_hash`: This is a lifesaver. It creates a cryptographic hash of the zip file. If a single line of Python changes, the hash changes, and Terraform knows it needs to upload a new version to AWS.
- `aws_lambda_alias`: This is a pointer to the latest published version of the Lambda function. It allows one to have multiple versions of the same function and switch between them easily.

# Invoking Lambda Functions

There are many ways to invoke a Lambda function:

- **Test in the console**: One can test the Lambda function directly in the AWS Management Console by providing a sample event payload and clicking the "Test" button. This is useful for quick debugging and validation of the function's logic.
- **API Gateway**: One can set up an API Gateway to expose the Lambda function as a RESTful API endpoint. This allows external clients to invoke the function via HTTP requests, making it suitable for building serverless web applications or APIs.
- **Event Bridge**: One can use Amazon EventBridge to trigger the Lambda function based on specific events or schedules. This is useful for automating tasks, responding to system events, or integrating with other AWS services.
- **Event Source Mapping**: Lambda can be triggered by various AWS services, such as S3, DynamoDB, Kinesis, and more. This allows for automatic invocation of the function when specific events occur in these services.

## Example

```hcl
# Trigger the HelloWorldAPI Lambda from EventBridge scheduler every Monday at 08:00 Tokyo time

# 1. Trust relationship allowing EventBridge Scheduler to assume the role
data "aws_iam_policy_document" "scheduler_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["scheduler.amazonaws.com"]
    }
  }
}

# 2. Role the scheduler uses to invoke the Lambda
resource "aws_iam_role" "scheduler_exec_role" {
  name               = "HelloWorldSchedulerRole"
  assume_role_policy = data.aws_iam_policy_document.scheduler_assume_role.json
}

# 3. Permission to invoke the specific Lambda alias
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

# 4. The weekly schedule (every Monday 08:00 Asia/Tokyo)
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

**Key Code Breakdown:**

- `aws_scheduler_schedule`: This resource creates a scheduled event that triggers the Lambda function every Monday at 08:00 Tokyo time. The `schedule_expression` uses a cron expression to define the schedule.
- `aws_iam_role`: This role allows the EventBridge Scheduler to assume the role and invoke the Lambda function. The trust relationship is defined in the `scheduler_assume_role` policy document.
- `aws_iam_role_policy`: This policy grants the necessary permissions for the scheduler to invoke the specific Lambda alias. The `scheduler_invoke_lambda` policy document specifies the `lambda:InvokeFunction` action and the ARN of the Lambda alias as the resource.
