# AWS Settings
variable "aws_region" {
  description = "The AWS region things are created in"
  default     = "us-east-1"
}

variable "aws_profile" {
  description = "The profile to use for AWS specified in ~/.aws/credentials"
}

# Application Settings

variable "name" {
  description = "Name of the application"
  default     = "searchneu"
}

variable "stage" {
  description = "Stage of deployment (prod, staging, etc)"
  default     = "prod"
}

variable "secrets" {
  description = "Secrets to put in SSM Parameter Store and add as environment variables"
}

# Docker + ALB Settings
variable "ecs_task_execution_role_name" {
  description = "ECS task execution role name"
  default = "myEcsTaskExecutionRole"
}

variable "az_count" {
  description = "Number of AZs to cover in a given region"
  default     = "2"
}

variable "app_port" {
  description = "Port exposed by the docker image to redirect traffic to"
  default     = 5000
}

variable "app_count" {
  description = "Number of docker containers to run"
  default     = 1
}

variable "health_check_path" {
  default = "/"
}

variable "fargate_cpu" {
  description = "Fargate instance CPU units to provision (1 vCPU = 1024 CPU units)"
  default     = "512"
}

variable "fargate_memory" {
  description = "Fargate instance memory to provision (in MiB)"
  default     = "1024"
}

