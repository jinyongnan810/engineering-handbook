# ECS and Fargate

## Running Containers Without Managing Servers

For long-running microservices, web servers, or complex API backends built inside Docker containers, one uses **Amazon ECS (Elastic Container Service)** with **AWS Fargate**.

In container management on AWS, there are four core components:

- **Amazon ECS (The Orchestrator):** ECS is the management plane that schedules, deploys, and monitors containerized applications across the environment.
- **AWS Fargate (The Serverless Compute Engine):** Instead of provisioning EC2 instances, picking instance types, and managing host OS updates, Fargate acts as serverless compute for containers. One simply specifies how much CPU and RAM the container needs, and AWS provisions and manages the underlying infrastructure automatically.
- **Task Definition (The Blueprint):** A JSON specification that defines the container setup—which Docker image to pull (from ECR or Docker Hub), CPU/RAM limits, port mappings, environment variables, and log configurations.
- **ECS Service (The Controller):** The service ensures that a specified number of tasks (`desired_count`) are running continuously. If a container crashes, the ECS service automatically destroys the failed task and launches a new one to maintain application availability.

### IAM Roles in ECS

ECS uses two distinct IAM roles:

1. **Task Execution Role:** Used by the _AWS Fargate agent_ itself (e.g., pulling Docker images from AWS ECR and pushing container logs to CloudWatch Logs).
2. **Task Role:** Used by the _application code_ running inside the container (e.g., if a Node.js or Python app needs to write to an S3 bucket or DynamoDB table).

---

### Example

```hcl
# Create an ECS Fargate service with a simple Nginx container, including CloudWatch logging and IAM roles.
# 1. CloudWatch Log Group for Container Logs
resource "aws_cloudwatch_log_group" "ecs_logs" {
  name              = "/ecs/nginx-app"
  retention_in_days = 7
}

# 2. IAM Task Execution Role (Used by Fargate agent to pull images & write logs)
data "aws_iam_policy_document" "ecs_task_execution_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ecs_execution_role" {
  name               = "ecsTaskExecutionRole"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_execution_assume_role.json
}

resource "aws_iam_role_policy_attachment" "ecs_execution_attach" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# 3. ECS Cluster
resource "aws_ecs_cluster" "app_cluster" {
  name = "production-ecs-cluster"
}

# 4. ECS Task Definition (The Container Blueprint)
resource "aws_ecs_task_definition" "app_task" {
  family                   = "nginx-task"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc" # Required for Fargate
  cpu                      = "256"    # 0.25 vCPU
  memory                   = "512"    # 512 MB
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "nginx-container"
      image     = "public.ecr.aws/docker/library/nginx:latest"
      essential = true

      portMappings = [
        {
          containerPort = 80
          hostPort      = 80
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_logs.name
          "awslogs-region"        = "ap-northeast-1"
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}

# 5. ECS Service (Maintains running containers)
resource "aws_ecs_service" "app_service" {
  name            = "nginx-service"
  cluster         = aws_ecs_cluster.app_cluster.id
  task_definition = aws_ecs_task_definition.app_task.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.private_subnet.id, aws_subnet.private_subnet_2.id]
    security_groups  = [aws_security_group.ecs_sg.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.app_tg.arn
    container_name   = "nginx-container"
    container_port   = 80
  }

  # Wait for the listener to be ready before creating the service
  depends_on = [aws_lb_listener.http]
}
```

**Key Code Breakdown:**

- **`network_mode = "awsvpc"`:** Fargate strictly requires `awsvpc` network mode. This gives every running task its own dedicated Elastic Network Interface (ENI) and private IP address inside the VPC subnets.
- **`AmazonECSTaskExecutionRolePolicy`:** AWS-managed policy granting the Fargate agent essential permissions to write container standard error/output logs to CloudWatch and authenticate with container registries.
- **`jsonencode([...])`:** Defines container configuration parameters (image repository, CPU/memory allocations, exposed ports, logging drivers) cleanly within native Terraform syntax.

![ECS Architecture](https://ik.imagekit.io/kinn/my%20assets/ecs.png)
