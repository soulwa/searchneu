# Get HTTPS cert
resource "aws_acm_certificate" "cert" {
  domain_name       = var.domain
  validation_method = "DNS"

  tags = {
    Environment = var.stage
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "cloudflare_record" "cert" {
  zone_id = var.cloudflare_zone_id
  name = aws_acm_certificate.cert.domain_validation_options.0.resource_record_name
  type = aws_acm_certificate.cert.domain_validation_options.0.resource_record_type
  value = aws_acm_certificate.cert.domain_validation_options.0.resource_record_value
  ttl = 1
}

resource "cloudflare_record" "alb" {
  zone_id = var.cloudflare_zone_id
  name = var.domain
  type = "CNAME"
  value = module.alb.this_lb_dns_name
  proxied = true
}