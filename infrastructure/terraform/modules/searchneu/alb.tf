# ============= Load Balancer ================
module "alb" {
  source  = "terraform-aws-modules/alb/aws"
  version = "~> 5.0"
  
  name = module.label.id

  load_balancer_type = "application"

  vpc_id             = var.vpc_id
  subnets            = var.public_subnet_ids
  security_groups    = [aws_security_group.lb.id]
  
  target_groups = [
    {
      name_prefix      = "def"
      backend_protocol = "HTTP"
      backend_port     = 80
      vpc_id           = var.vpc_id
      target_type      = "ip"
    }
  ]

  http_tcp_listeners = [
    {
      port        = 80
      protocol    = "HTTP"
      action_type = "redirect"
      redirect = {
        port        = "443"
        protocol    = "HTTPS"
        status_code = "HTTP_301"
      }
    }
  ]

  https_listeners = [
    {
      port               = 443
      protocol           = "HTTPS"
      certificate_arn    = var.certificate_arn
      target_group_index = 0
    }
  ]

  tags = {
    Environment = var.stage
  }
}

# ALB Security Group: Edit to restrict access to the application
resource "aws_security_group" "lb" {
  name        = "${module.label.id}-load-balancer-security-group"
  description = "controls access to the ALB"
  vpc_id      = var.vpc_id

  ingress {
    protocol    = "tcp"
    from_port   = 80
    to_port     = var.app_port
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }
}
