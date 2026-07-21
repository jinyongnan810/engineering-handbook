# Lambda

**AWS Lambda** changes everything. It is a true serverless compute service. We simply upload the code (Python, Node.js, Go, etc.) or specify images, and AWS handles 100% of the underlying infrastructure.

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
  source_file = "index.py"            # The local file the code is written in
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

  # Publish a new immutable version each time the code changes
  publish = true

  # This hash tells Terraform to update the function ONLY if your Python code actually changes!
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
