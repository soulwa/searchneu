module "main_label" {
  source     = "git::https://github.com/cloudposse/terraform-null-label.git?ref=0.16.0"
  stage      = var.stage
  name       = var.name
  delimiter  = "-"
}