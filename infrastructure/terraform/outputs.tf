# outputs.tf

output "alb_hostname" {
  description = "Public URL of load balancer"
  value = module.alb.this_lb_dns_name
}

output "DNS_verification" {
  description = "DNS validation records to add to get HTTPS"
  value = aws_acm_certificate.cert.domain_validation_options
}

output "github_actions_AWS_ACCESS_KEY_ID" {
  value = aws_iam_access_key.github_actions_user.id
}
output "github_actions_AWS_SECRET_ACCESS_KEY" {
  value = aws_iam_access_key.github_actions_user.secret
}