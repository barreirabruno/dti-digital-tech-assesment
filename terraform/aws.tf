terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Configure the AWS provider
provider "aws" {
  region  = var.region
  profile = "tech-challenges-barreiradev"
}

# Create a VPC with DNS support and DNS hostnames enabled
resource "aws_vpc" "main_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "main_vpc"
  }
}

# Create a public subnet
resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.main_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true

  tags = {
    Name = "public_subnet"
  }
}

# Create an internet gateway and attach it to the VPC
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main_vpc.id

  tags = {
    Name = "main_igw"
  }
}

# Configure the route table for the public subnet
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.main_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "public_rt"
  }
}

resource "aws_route_table_association" "public_rt_assoc" {
  subnet_id      = aws_subnet.public_subnet.id
  route_table_id = aws_route_table.public_rt.id
}

# Create a security group for the EC2 instance
resource "aws_security_group" "ec2_sg" {
  vpc_id = aws_vpc.main_vpc.id
  name   = "allow_ssh_api_gateway"

  ingress {
    description = "Allow SSH for management"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Allow traffic on port 3333 from VPC"
    from_port   = 3333
    to_port     = 3333
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.main_vpc.cidr_block]
  }

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "ec2_sg"
  }
}

# Launch EC2 instance and install Docker
resource "aws_instance" "docker_ec2" {
  ami             = "ami-0453ec754f44f9a4a" # Replace with Amazon Linux 2 AMI
  instance_type   = "t2.micro"
  subnet_id       = aws_subnet.public_subnet.id
  security_groups = [aws_security_group.ec2_sg.id]
  key_name        = "my-key-pair"

  user_data = <<-EOF
                #!/bin/bash
                set -e
                sudo yum update -y
                sudo yum install -y docker
                sudo systemctl start docker
                sudo systemctl enable docker
                sudo usermod -aG docker ec2-user
                docker pull barreiradev/optimized-node-api:0.0.1
                docker run -d -p 3333:3333 barreiradev/optimized-node-api:0.0.1
                EOF

  tags = {
    Name = "docker_ec2"
  }
}

# OUTPUT EC2 PRIVATE_IP
output "ec2_private_ip" {
  value = aws_instance.docker_ec2.private_ip
}

# Create a Network Load Balancer
resource "aws_lb" "ec2_nlb" {
  name               = "ec2-nlb"
  internal           = false
  load_balancer_type = "network"
  subnets            = [aws_subnet.public_subnet.id]

  tags = {
    Name = "ec2_nlb"
  }
}

# Create a Target Group for the NLB
resource "aws_lb_target_group" "ec2_tg" {
  name        = "ec2-target-group"
  port        = 3333
  protocol    = "TCP"
  vpc_id      = aws_vpc.main_vpc.id
  target_type = "instance"

  health_check {
    enabled             = true
    interval            = 30
    protocol            = "TCP"
    port                = 3333
    healthy_threshold   = 3
    unhealthy_threshold = 3
  }

  tags = {
    Name = "ec2_tg"
  }
}

# Register the EC2 instance with the Target Group
resource "aws_lb_target_group_attachment" "ec2_attachment" {
  target_group_arn = aws_lb_target_group.ec2_tg.arn
  target_id        = aws_instance.docker_ec2.id
  port             = 3333
}

# Create a Listener for the NLB
resource "aws_lb_listener" "nlb_listener" {
  load_balancer_arn = aws_lb.ec2_nlb.arn
  port              = 3333
  protocol          = "TCP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.ec2_tg.arn
  }
}

# Create a VPC Link for API Gateway
resource "aws_api_gateway_vpc_link" "vpc_link" {
  name        = "vpc_link_to_ec2"
  description = "VPC Link to connect API Gateway with EC2 NLB"
  target_arns = [aws_lb.ec2_nlb.arn]

  tags = {
    Name = "api_gateway_vpc_link"
  }
}

# Create API Gateway
resource "aws_api_gateway_rest_api" "ec2_api" {
  name        = "ec2_api_gateway"
  description = "API Gateway to connect to EC2 instance via VPC Link"
}

# Create API Gateway Resource
resource "aws_api_gateway_resource" "hello_resource" {
  rest_api_id = aws_api_gateway_rest_api.ec2_api.id
  parent_id   = aws_api_gateway_rest_api.ec2_api.root_resource_id
  path_part   = "api"
}

# Create API Gateway method(GET)
resource "aws_api_gateway_method" "hello_method" {
  rest_api_id   = aws_api_gateway_rest_api.ec2_api.id
  resource_id   = aws_api_gateway_resource.hello_resource.id
  http_method   = "GET"
  authorization = "NONE"
}

# Integrate API Gateway with the EC2 instance using VPC Link
resource "aws_api_gateway_integration" "hello_integration" {
  rest_api_id          = aws_api_gateway_rest_api.ec2_api.id
  resource_id          = aws_api_gateway_resource.hello_resource.id
  http_method          = aws_api_gateway_method.hello_method.http_method
  integration_http_method = "GET"

  type            = "HTTP"
  uri             = "http://${aws_instance.docker_ec2.private_ip}:3333/api"

  connection_type = "VPC_LINK"
  connection_id   = aws_api_gateway_vpc_link.vpc_link.id
}

# API Gateway Integration Response
resource "aws_api_gateway_integration_response" "hello_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.ec2_api.id
  resource_id = aws_api_gateway_resource.hello_resource.id
  http_method = aws_api_gateway_method.hello_method.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Content-Type" = "integration.response.header.Content-Type"
  }

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.hello_integration]
}

# API Gateway Method Response
resource "aws_api_gateway_method_response" "hello_method_response" {
  rest_api_id = aws_api_gateway_rest_api.ec2_api.id
  resource_id = aws_api_gateway_resource.hello_resource.id
  http_method = aws_api_gateway_method.hello_method.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Content-Type" = true
  }

  depends_on = [aws_api_gateway_method.hello_method]
}

# Deploy API Gateway
resource "aws_api_gateway_deployment" "api_deployment" {
  depends_on = [aws_api_gateway_integration.hello_integration]
  rest_api_id = aws_api_gateway_rest_api.ec2_api.id
}

resource "aws_api_gateway_stage" "api_stage" {
  stage_name    = "dev"
  rest_api_id   = aws_api_gateway_rest_api.ec2_api.id
  deployment_id = aws_api_gateway_deployment.api_deployment.id

  tags = {
    Name = "dev-stage"
  }
}

# Output the Invoke URL
output "api_gateway_invoke_url" {
  value = "https://${aws_api_gateway_rest_api.ec2_api.id}.execute-api.${var.region}.amazonaws.com/${aws_api_gateway_stage.api_stage.stage_name}/api"
}
