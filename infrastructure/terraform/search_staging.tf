module "staging" {
  source = "./modules/searchneu"

  stage              = "staging"
  domain             = "staging.searchneu.com"

  vpc_id             = aws_vpc.main.id
  public_subnet_ids  = aws_subnet.public.*.id
  private_subnet_ids = aws_subnet.private.*.id

  ecr_url = aws_ecr_repository.app.repository_url

  secrets = var.staging_secrets

  cloudflare_zone_id = var.cloudflare_zone_id
  certificate_arn    = aws_acm_certificate.cert.arn
}