output "rds_host" {
  value = aws_db_instance.default.address
}
output "rds_ps" {
  value = aws_db_instance.default.password
}

output "es_host" {
  value = module.elasticsearch.domain_endpoint
}

output "alb_dns_name" {
  value = module.alb.this_lb_dns_name
}