# AWS Networking

## VPC (Virtual Private Cloud)

Before one can deploy a database or a web server, it's necessary to have a network for them to live in. In AWS, this is called a **VPC (Virtual Private Cloud)**. Think of a VPC as our own logically isolated slice of the AWS cloud.

Inside the VPC, we divide the network into smaller chunks called Subnets:

- **Public Subnets**: These have a direct route to the outside world via an Internet Gateway (IGW). You put public-facing resources here, like load balancers or bastion hosts.
- **Private Subnets**: These have no direct route to the internet. This is where your sensitive backend resources live, like application servers and databases.

To control how traffic flows between these subnets and the internet, we use **Route Tables**. A Route Table is essentially a set of rules (routes) that acts as a traffic cop, directing network packets exactly where they need to go.

### Example

```hcl
# Create a VPC and two subnets (one public, one private) in AWS.
# 1. Create the VPC
resource "aws_vpc" "main_vpc" {
  cidr_block           = "10.0.0.0/16" # Provides up to 65,536 IP addresses
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "Production-VPC"
  }
}

# 2. Create the Internet Gateway (The door to the outside world)
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main_vpc.id

  tags = {
    Name = "Production-IGW"
  }
}

# 3. Create a Public Subnet
resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.main_vpc.id
  cidr_block              = "10.0.1.0/24" # 256 IPs
  map_public_ip_on_launch = true          # Automatically assigns public IPs to instances here

  tags = {
    Name = "Public-Subnet-1"
  }
}

# 4. Create a Route Table for the Public Subnet
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.main_vpc.id

  # This route directs all outbound traffic (0.0.0.0/0) to the Internet Gateway
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
}

# 5. Associate the Route Table with the Public Subnet
resource "aws_route_table_association" "public_assoc" {
  subnet_id      = aws_subnet.public_subnet.id
  route_table_id = aws_route_table.public_rt.id
}

# 6. Create a Private Subnet (No route to the IGW!)
resource "aws_subnet" "private_subnet" {
  vpc_id     = aws_vpc.main_vpc.id
  cidr_block = "10.0.2.0/24"

  tags = {
    Name = "Private-Subnet-1"
  }
}
```

## NAT Gateways and Elastic IPs

To solve problems like give the private database outbound internet access to download patches without making it publicly accessible, we can use a **NAT(Network Address Translation) Gateway**.

- **How it works**: A NAT Gateway resides in a public subnet. It allows resources in private subnets to initiate outbound connections to the internet (e.g., for software updates) while preventing inbound internet connections. It acts as a one-way mirror.
- **The Elastic IP (EIP)**: To communicate with the internet, the NAT Gateway requires a static, public IPv4 address, known as an Elastic IP.
- **The Private Route Table**: Just like we did for the public subnet, we must explicitly tell the private subnet how to route its traffic. We create a new route table for the private subnet that points all outbound internet traffic (0.0.0.0/0) directly to the NAT Gateway.

### Example

```hcl
# Set up NAT Gateway for Private Subnet to access the Internet via the Public Subnet
# 1. Allocate an Elastic IP for the NAT Gateway
resource "aws_eip" "nat_eip" {
  domain = "vpc"

  tags = {
    Name = "Production-NAT-EIP"
  }
}

# 2. Create the NAT Gateway (Must live in the PUBLIC subnet!)
resource "aws_nat_gateway" "nat_gw" {
  allocation_id = aws_eip.nat_eip.id
  subnet_id     = aws_subnet.public_subnet.id # Placing it in the public subnet

  tags = {
    Name = "Production-NAT-GW"
  }

  # Best Practice: Ensure the IGW exists before creating a NAT Gateway
  depends_on = [aws_internet_gateway.igw]
}

# 3. Create a Route Table specifically for the Private Subnet
resource "aws_route_table" "private_rt" {
  vpc_id = aws_vpc.main_vpc.id

  # Direct all outbound traffic to the NAT Gateway
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat_gw.id
  }

  tags = {
    Name = "Private-Route-Table"
  }
}

# 4. Associate the Route Table with the Private Subnet
resource "aws_route_table_association" "private_assoc" {
  subnet_id      = aws_subnet.private_subnet.id
  route_table_id = aws_route_table.private_rt.id
}
```

![VPC Diagram](https://ik.imagekit.io/kinn/my%20assets/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202026-07-19%2010.40.48.png)
