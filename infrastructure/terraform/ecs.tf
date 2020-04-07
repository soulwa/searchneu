# ecs.tf

resource "aws_ecs_cluster" "main" {
  name = module.main_label.id
}

# Do we need to specify cpu and memory in the container definition? The task definition already defines it.
module "webserver-container" {
  source          = "git::https://github.com/cloudposse/terraform-aws-ecs-container-definition.git?ref=0.23.0"
  container_name  = "${module.main_label.id}-webserver"
  container_image = "${aws_ecr_repository.app.repository_url}:latest"

  log_configuration = {
    logDriver = "awslogs"
    options = {
      awslogs-group         = "/ecs/${module.main_label.id}"
      awslogs-region        = var.aws_region
      awslogs-stream-prefix = "ecs"
    }
    secretOptions = null
  }

  port_mappings   = [
    {
      containerPort = var.app_port
      hostPort      = var.app_port
      protocol      = "tcp"
    }
  ]
  
  secrets = [
    for ssmParam in aws_ssm_parameter.default:
    {
      name = ssmParam.name
      valueFrom = ssmParam.arn
    }
  ]
}

module "scrape-container" {
  source          = "git::https://github.com/cloudposse/terraform-aws-ecs-container-definition.git?ref=0.23.0"
  container_name  = "${module.main_label.id}-scrape"
  container_image = "${aws_ecr_repository.app.repository_url}:latest"
  container_cpu   = 1024
  container_memory= 3072

  command         = ["yarn", "prod:scrape"]

  log_configuration = {
    logDriver = "awslogs"
    options = {
      awslogs-group         = "/ecs/${module.main_label.id}"
      awslogs-region        = var.aws_region
      awslogs-stream-prefix = "ecs"
    }
    secretOptions = null
  }
  
  secrets = [
    for ssmParam in aws_ssm_parameter.default:
    {
      name = ssmParam.name
      valueFrom = ssmParam.arn
    }
  ]
}

resource "aws_ecs_task_definition" "app" {
  family                   = "${module.main_label.id}-webserver"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.fargate_cpu
  memory                   = var.fargate_memory
  container_definitions    = module.webserver-container.json
}

resource "aws_ecs_task_definition" "scrape" {
  family                   = "${module.main_label.id}-scrape"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 1024
  memory                   = 3072
  container_definitions    = module.scrape-container.json
}

resource "aws_ecs_service" "main" {
  name            = module.main_label.id
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = var.app_count
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [aws_security_group.ecs_tasks.id]
    subnets          = aws_subnet.private.*.id
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_alb_target_group.app.id
    container_name   = "${module.main_label.id}-webserver"
    container_port   = var.app_port
  }

  depends_on = [aws_alb_listener.front_end, aws_iam_role_policy_attachment.ecs_task_execution_role, null_resource.enable_long_ecs_resource_ids]
}


locals {
  all_secrets_unsorted = concat(var.secrets, [
    {
      name        = "elasticURL"
      value       = "https://${module.elasticsearch.domain_endpoint}"
      description = "Elasticsearch hostname"
    },
    {
      name        = "dbUsername"
      value       = aws_db_instance.default.username
      description = "Postgres database username"
    },
    {
      name        = "dbPassword"
      value       = aws_db_instance.default.password
      description = "Postgres database password"
    },
    {
      name        = "dbName"
      value       = aws_db_instance.default.name
      description = "Postgres database name"
    },
    {
      name        = "dbHost"
      value       = aws_db_instance.default.address
      description = "Postgres database host"
    }
  ])
  # For some insane reason the secrets list is unstable. We have to sort it to prevent recreating the params every time.
  all_secrets_keys = [for s in local.all_secrets_unsorted : lookup(s, "name")]
  all_secrets_name_map = zipmap(local.all_secrets_keys, local.all_secrets_unsorted)
  all_secrets = [
    for key in sort(local.all_secrets_keys): 
    {
      name = key
      value = lookup(lookup(local.all_secrets_name_map, key), "value")
      description = lookup(lookup(local.all_secrets_name_map, key), "description")
    }
  ]
}
# Secrets to put in env
# Maybe use a KMS for better security?
# Also this module https://github.com/cloudposse/terraform-aws-ssm-parameter-store is nice but not up to date with Terraform 0.12
resource "aws_ssm_parameter" "default" {
  count           = length(var.secrets) + 5
  name            = lookup(local.all_secrets[count.index], "name")
  description     = lookup(local.all_secrets[count.index], "description", lookup(local.all_secrets[count.index], "name"))
  type            = "SecureString"
  value           = lookup(local.all_secrets[count.index], "value")
  overwrite       = lookup(local.all_secrets[count.index], "overwrite", "true")
  depends_on      = [module.elasticsearch, aws_db_instance.default]
}