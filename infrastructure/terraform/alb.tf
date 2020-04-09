# alb.tf
module "alb" {
  source  = "terraform-aws-modules/alb/aws"
  version = "~> 5.0"
  
  name = module.main_label.id

  load_balancer_type = "application"

  vpc_id             = aws_vpc.main.id
  subnets            = aws_subnet.public.*.id
  security_groups    = [aws_security_group.lb.id]
  
  target_groups = [
    {
      name_prefix      = "def"
      backend_protocol = "HTTP"
      backend_port     = 80
      vpc_id           = aws_vpc.main.id
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
      certificate_arn    = aws_acm_certificate.cert.arn
      target_group_index = 0
    }
  ]

  tags = {
    Environment = var.stage
  }
}

# Get HTTPS cert
resource "aws_acm_certificate" "cert" {
  domain_name       = var.domain
  validation_method = "DNS"

  tags = {
    Environment = var.stage
  }

  lifecycle {
    create_before_destroy = true
  }
}
