module "staging" {
  source = "./modules/searchneu"

  stage              = "staging"

  vpc_id             = aws_vpc.main.id
  public_subnet_ids  = aws_subnet.public.*.id
  private_subnet_ids = aws_subnet.private.*.id

  ecr_url = aws_ecr_repository.app.repository_url

  secrets = var.staging_secrets

  cloudflare_zone_id = var.cloudflare_zone_id
  certificate_arn    = aws_acm_certificate.cert.arn

  jumphost_sg_id     = aws_security_group.jumphost.id
}

# domain record
resource "cloudflare_record" "staging" {
  zone_id = var.cloudflare_zone_id
  name = "staging.searchneu.com"
  type = "CNAME"
  value = module.staging.alb_dns_name
  proxied = true
}