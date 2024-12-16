terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Configure the AWS provider
provider "aws" {
  region = var.region
  profile = "tech-challenges-barreiradev"
}

# Create a VPC
resource "aws_vpc" "main_vpc" {
  cidr_block = "10.0.0.0/16"

  tags = {
    Name = "main_vpc"
  }
}

# Create a public subnet
resource "aws_subnet" "public_subnet" {
  vpc_id = aws_vpc.main_vpc.id
  cidr_block = "10.0.1.0/24"
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
  subnet_id = aws_subnet.public_subnet.id
  route_table_id = aws_route_table.public_rt.id
}

# Create a security group for the EC2 instance
resource "aws_security_group" "ec2_sg" {
  vpc_id = aws_vpc.main_vpc.id
  name = "allow_ssh_http"

  ingress {
    description = "Allow SSH"
    from_port = 22
    to_port = 22
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 3333
    to_port     = 3333
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Allow HTTP access to your app
  }

  egress {
    description = "Allow all outbound traffic"
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "ec2_sg"
  }
}

# Launch EC2 instance and install Docker
resource "aws_instance" "docker_ec2" {
  ami                    = "ami-0453ec754f44f9a4a" # Replace with Amazon Linux 2 AMI
  instance_type          = "t2.micro"
  subnet_id              = aws_subnet.public_subnet.id
  security_groups        = [aws_security_group.ec2_sg.id]
  key_name               = "my-key-pair"

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


# OUTPUT EC2 PUBLIC_IP
output "ec2_public_ip" {
  value = aws_instance.docker_ec2.public_ip
}

resource "aws_api_gateway_rest_api" "ec2_api" {
  name = "ec2_api_gateway"
  description = "API Gateway to connect to EC2 instance"
}

# Create API Gateway Resource
resource "aws_api_gateway_resource" "hello_resource" {
  rest_api_id = aws_api_gateway_rest_api.ec2_api.id
  parent_id = aws_api_gateway_rest_api.ec2_api.root_resource_id
  path_part = "api"
}

# Create API Gateway method(GET)
resource "aws_api_gateway_method" "hello_method" {
  rest_api_id = aws_api_gateway_rest_api.ec2_api.id
  resource_id = aws_api_gateway_resource.hello_resource.id
  http_method = "GET"
  authorization = "NONE" #NO AUTHENTICATION
}

# Integrate API gateway with EC2 instance public IP
resource "aws_api_gateway_integration" "hello_integration" {
  rest_api_id = aws_api_gateway_rest_api.ec2_api.id
  resource_id = aws_api_gateway_resource.hello_resource.id
  http_method = aws_api_gateway_method.hello_method.http_method

  integration_http_method = "GET"
  type                    = "HTTP"
  uri                     = "http://${aws_instance.docker_ec2.public_ip}:3333/api"

  request_parameters = {
    "integration.request.header.Host" = "'${aws_instance.docker_ec2.public_ip}'"
  }
}

# Method Response - Defines the 200 response for the API Gateway method
resource "aws_api_gateway_method_response" "hello_method_response" {
  rest_api_id = aws_api_gateway_rest_api.ec2_api.id
  resource_id = aws_api_gateway_resource.hello_resource.id
  http_method = aws_api_gateway_method.hello_method.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Content-Type" = true
  }
}

# Integration Response - Maps backend 200 response to API Gateway
resource "aws_api_gateway_integration_response" "hello_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.ec2_api.id
  resource_id = aws_api_gateway_resource.hello_resource.id
  http_method = aws_api_gateway_method.hello_method.http_method
  status_code = "200"
}

# Deploy the API
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
  value = "${aws_api_gateway_rest_api.ec2_api.id}.execute-api.${var.region}.amazonaws.com/${aws_api_gateway_stage.api_stage.stage_name}"
}
