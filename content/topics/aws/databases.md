# Managed Databases (Amazon RDS PostgreSQL & DynamoDB tables)

---

## Relational vs. Serverless NoSQL

When there is a need to store application data persistently, AWS gives two primary paths, and they operate very differently in the cloud:

- **Amazon RDS (Relational Database Service):** This is for traditional, structured SQL databases (like PostgreSQL, MySQL, or Oracle). RDS provisions underlying EC2 instances to run the database engine. Because it relies on servers, an RDS instance **must live inside the VPC** (specifically in private subnets) to remain secure.
- **Amazon DynamoDB:** This is AWS's native, serverless NoSQL database. It stores data as key-value pairs (JSON-like documents) and is designed to handle massive scale with single-digit millisecond latency. Unlike RDS, DynamoDB is **serverless and lives completely outside the VPC**. We interact with it over the internet via the AWS API, relying strictly on IAM policies for security rather than network firewalls.

### Example

```hcl
# Create one RDS PostgreSQL instance and one DynamoDB table.
# ---------------------------------------------------------
# 1. RDS POSTGRESQL (Relational, VPC-bound)
# ---------------------------------------------------------

# Create a DB Subnet Group (Tells RDS which subnets to live in)
resource "aws_db_subnet_group" "db_subnet" {
  name       = "main_db_subnet_group"
  # Place the database in the private subnets for security
  subnet_ids = [
    aws_subnet.private_subnet.id,
    aws_subnet.private_subnet_2.id
  ]

  tags = {
    Name = "Main DB Subnet Group"
  }
}

# Provision the RDS PostgreSQL Instance
resource "aws_db_instance" "postgres_db" {
  identifier             = "production-postgres"
  engine                 = "postgres"
  engine_version         = "18.4"
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  username               = "dbadmin"
  password               = "SuperSecretPassword123!" # Note: Use AWS Secrets Manager in real production!
  db_subnet_group_name   = aws_db_subnet_group.db_subnet.name
  skip_final_snapshot    = true # Set to false in production to keep a backup when deleting
}

# ---------------------------------------------------------
# 2. DYNAMODB (Serverless, NoSQL, IAM-secured)
# ---------------------------------------------------------

# Provision a serverless DynamoDB table for user sessions
resource "aws_dynamodb_table" "user_sessions" {
  name         = "UserSessions"
  billing_mode = "PAY_PER_REQUEST" # Serverless auto-scaling billing
  hash_key     = "SessionId"       # The primary key

  attribute {
    name = "SessionId"
    type = "S" # "S" stands for String
  }

  tags = {
    Environment = "Production"
  }
}

```

**Key Code Breakdown:**

- `db_subnet_group_name`: RDS instances span multiple subnets for high availability. We must explicitly pass the private subnet IDs into a group, and assign that group to the database.(only one subnet will fail)
- `skip_final_snapshot`: By default, AWS prevents one from accidentally deleting a database via Terraform without taking a final backup. Set this to `true` here just so we can cleanly destroy the sandbox environment later.
- `PAY_PER_REQUEST`: Instead of guessing how much read/write capacity one's DynamoDB table needs (and paying for it 24/7), this setting tells AWS to scale capacity up and down instantly and bill only for exactly what one use.
