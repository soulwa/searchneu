# outputs.tf

output "alb_hostname" {
  value = aws_alb.main.dns_name
}

output "ecr_url" {
  value = aws_ecr_repository.app.repository_url
}
