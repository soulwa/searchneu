# AWS Settings
variable "aws_region" {
  description = "The AWS region things are created in"
  default     = "us-east-1"
}

variable "aws_profile" {
  description = "The profile to use for AWS specified in ~/.aws/credentials"
}

# Cloudflare

variable "cloudflare_api_token" {
  description = "cloudflare token"
} 

variable "cloudflare_zone_id" {
  description = "cloudflare zone id"
} 

# Github
variable "github_token" {
  description = "github personal access token"
}

# Application Settings

variable "name" {
  description = "Name of the application"
  default     = "searchneu"
}

variable "prod_secrets" {
  description = "Secrets to put in SSM Parameter Store and add as environment variables"
}

# Docker + ALB Settings
variable "az_count" {
  description = "Number of AZs to cover in a given region"
  default     = "2"
}

