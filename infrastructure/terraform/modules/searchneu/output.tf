
output "alb_hostname" {
  description = "Public URL of load balancer"
  value = module.alb.this_lb_dns_name
}

output "DNS_verification" {
  description = "DNS validation records to add to get HTTPS"
  value = aws_acm_certificate.cert.domain_validation_options
}