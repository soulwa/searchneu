# provider.tf

# Specify the provider and access details
provider "aws" {
  shared_credentials_file = "$HOME/.aws/credentials"
  profile                 = var.aws_profile
  region                  = var.aws_region
}

provider "cloudflare" {
  version = "~> 2.0"
  api_token   = var.cloudflare_api_token
}

provider "github" {
  token        = var.github_token
  organization = "sandboxnu"
}