# What's deployed

Docs are always wrong. `infrastructure/terraform` is the source of truth. 

# High level 

Everything is in a VPC. The ALB is the only thing in a public security group.
Webserver is deployed to ECS service sitting behind ALB. RDS Postgres and Elasticsearch Service whitelist traffic from webserver security group. Scrapers run on scheduled task triggered by CloudWatch. 

# Scripts

`push-image` pushes your current local file to ECR. Should only be used locally in emergencies. Typically runs from Github Actions

`redeploy` deploys latest image in ECR to the prod webservers.

`run-task` runs a one-off task by overriding docker command.

`scrape` starts the scraper in a task. Useful in case you need a rescrape _now_.