module "prod" {
  source = "./modules/searchneu"

  stage              = "prod"
  domain             = "docker.searchneu.com"

  vpc_id             = aws_vpc.main.id
  public_subnet_ids  = aws_subnet.public.*.id
  private_subnet_ids = aws_subnet.private.*.id

  ecr_url = aws_ecr_repository.app.repository_url

  secrets = var.prod_secrets

  cloudflare_zone_id = var.cloudflare_zone_id

  # depends_on = [null_resource.enable_long_ecs_resource_ids]
}