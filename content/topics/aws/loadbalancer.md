# ALB

## Distributing Traffic Across Containers

An **Application Load Balancer (ALB)** is the public entry point that sits in front of the ECS/Fargate service and distributes incoming HTTP/HTTPS traffic across the running tasks. Because Fargate tasks are ephemeral—each receiving its own private IP inside the VPC and being replaced whenever a task crashes or scales—clients cannot talk to them directly. The ALB solves this by providing a single, stable DNS name while continuously routing requests only to healthy targets.

The ALB operates at Layer 7 (the application layer), which means it can inspect the contents of each HTTP request and make routing decisions based on the path, host header, source IP, and other attributes.

There are four core components:

- **Load Balancer:** The internet-facing resource that lives in the public subnets and accepts incoming traffic. It is associated with a security group that controls which ports and sources are allowed.
- **Target Group:** A logical grouping of backends that receive traffic. For Fargate, the target type must be `ip` because each task registers by its private IP rather than by an EC2 instance ID. The target group also defines the health check used to decide whether a task is fit to serve requests.
- **Listener:** A process that checks for connection requests on a configured port and protocol (e.g., HTTP:80) and forwards them to a target group according to its rules.
- **Listener Rules:** Ordered conditions evaluated by priority that allow fine-grained control—forwarding, redirecting, or returning fixed responses—based on the request path, source IP, and more.

### Security Groups

Two security groups work together to create a secure chain:

1. **ALB Security Group:** Allows inbound HTTP (port 80) from anywhere on the internet (`0.0.0.0/0`), since the ALB is the public front door.
2. **ECS Tasks Security Group:** Allows inbound traffic **only** from the ALB's security group, not from the internet. This ensures the containers can never be reached directly and can only be accessed through the load balancer.

---

## Example

```hcl
# Application Load Balancer setup to expose the ECS service to the internet.

# 1. Security Group for the ALB (allow HTTP from anywhere)
resource "aws_security_group" "alb_sg" {
  name        = "alb-sg"
  description = "Allow inbound HTTP from the internet"
  vpc_id      = aws_vpc.main_vpc.id

  ingress {
    description = "HTTP from internet"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "alb-sg"
  }
}

# 2. Security Group for the ECS tasks (allow traffic only from the ALB)
resource "aws_security_group" "ecs_sg" {
  name        = "ecs-tasks-sg"
  description = "Allow inbound traffic from the ALB only"
  vpc_id      = aws_vpc.main_vpc.id

  ingress {
    description     = "App port from ALB"
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "ecs-tasks-sg"
  }
}

# 3. The Application Load Balancer (lives in the public subnets)
resource "aws_lb" "app_alb" {
  name               = "production-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = [aws_subnet.public_subnet.id, aws_subnet.public_subnet_2.id]

  tags = {
    Name = "production-alb"
  }
}

# 4. Target Group (target_type "ip" is required for Fargate/awsvpc)
resource "aws_lb_target_group" "app_tg" {
  name        = "production-app-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main_vpc.id
  target_type = "ip"

  health_check {
    path                = "/"
    protocol            = "HTTP"
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }

  tags = {
    Name = "production-app-tg"
  }
}

# 5. Listener (forwards HTTP:80 to the target group)
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.app_alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app_tg.arn
  }
}

# 6. Rule: allow /admin/* ONLY from the trusted IP (evaluated first)
resource "aws_lb_listener_rule" "admin_allow" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 10

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app_tg.arn
  }

  condition {
    path_pattern {
      values = ["/admin/*"]
    }
  }

  condition {
    source_ip {
      values = ["203.139.59.153/32"]
    }
  }
}

# 7. Rule: any other /admin/* request gets a hard-coded 403
resource "aws_lb_listener_rule" "admin_deny" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 20

  action {
    type = "fixed-response"

    fixed_response {
      content_type = "text/html"
      status_code  = "403"
      message_body = "<html><body><h1>403 Access Denied</h1></body></html>"
    }
  }

  condition {
    path_pattern {
      values = ["/admin/*"]
    }
  }
}

# Handy output: the public URL of the load balancer
output "alb_dns_name" {
  value       = aws_lb.app_alb.dns_name
  description = "Public DNS name of the Application Load Balancer"
}

```

**Key Code Breakdown:**

- **`target_type = "ip"`:** Required for Fargate. Because `awsvpc` networking gives every task its own private IP, targets register by IP address instead of by EC2 instance ID.
- **`security_groups` chaining:** The ECS tasks security group references the ALB security group in its `ingress` block rather than a CIDR range. This locks the containers down so they only accept traffic from the load balancer.
- **`health_check`:** The target group polls each task on the configured `path`. A task must return the expected `matcher` (HTTP 200) and pass `healthy_threshold` consecutive checks before the ALB routes traffic to it; failing `unhealthy_threshold` checks removes it from rotation.
- **Listener rule `priority`:** Rules are evaluated from lowest number to highest. The `admin_allow` rule (priority 10) is checked before `admin_deny` (priority 20), so a request from the trusted IP is forwarded, while every other `/admin/*` request falls through to the fixed 403 response.
- **`fixed-response` action:** Lets the ALB return a hard-coded HTTP response (such as a 403) directly, without ever forwarding the request to a backend task.
- **`internal = false`:** Marks the ALB as internet-facing, giving it a publicly resolvable DNS name in the public subnets.

![ALB Architecture](https://ik.imagekit.io/kinn/my%20assets/alb1.png)
![ALB Architecture 2](https://ik.imagekit.io/kinn/my%20assets/alb2.png)
