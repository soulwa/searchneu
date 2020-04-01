resource "aws_ecr_repository" "app" {
  name                 = module.main_label.id
}
