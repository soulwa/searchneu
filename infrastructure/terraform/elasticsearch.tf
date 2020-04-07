module "elasticsearch" {
  source                  = "git::https://github.com/cloudposse/terraform-aws-elasticsearch.git?ref=0.8.0"
  stage                   = var.stage
  name                    = var.name
  security_groups         = [aws_security_group.elasticsearch.id]
  vpc_id                  = aws_vpc.main.id
  subnet_ids              = aws_subnet.private.*.id
  zone_awareness_enabled  = "true"
  elasticsearch_version   = "7.1"
  instance_type           = "t2.small.elasticsearch"
  instance_count          = var.az_count # one instance in each AZ
  ebs_volume_size         = 10
  encrypt_at_rest_enabled = "false"

  create_iam_service_linked_role = "true"
  # iam_role_arns           = [aws_iam_role.ecs_task_execution_role.arn]
  # iam_actions             = ["es:ESHttpGet", "es:ESHttpPut", "es:ESHttpPost"]
}