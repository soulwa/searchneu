resource "aws_db_instance" "default" {
  identifier             = module.main_label.id
  allocated_storage      = 20
  engine                 = "postgres"
  engine_version         = "11.5"
  instance_class         = "db.t3.micro"
  name                   = module.main_label.name
  username               = "postgres"
  password               = random_password.db_pass.result
  parameter_group_name   = "default.postgres11"
  storage_encrypted      = true
  port                   = 5432
  db_subnet_group_name   = aws_db_subnet_group.default.id
  vpc_security_group_ids = [aws_security_group.postgres.id]
}

resource "random_password" "db_pass" {
  length = 16
}

resource "aws_db_subnet_group" "default" {
  name       = "main"
  subnet_ids = aws_subnet.private.*.id
}
