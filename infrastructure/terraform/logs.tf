# logs.tf

# Set up CloudWatch group and log stream and retain logs for 30 days
resource "aws_cloudwatch_log_group" "default_log_group" {
  name              = "/ecs/${module.main_label.id}-app"
  retention_in_days = 30

  tags = {
    Name = "${module.main_label.id}-log-group"
  }
}

resource "aws_cloudwatch_log_stream" "default_log_stream" {
  name           = "${module.main_label.id}-log-stream"
  log_group_name = aws_cloudwatch_log_group.default_log_group.name
}

