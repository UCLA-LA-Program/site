terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.34"
    }

    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.7.1"
    }
  }

  backend "s3" {
    bucket = "laprogram-terraform-state"
    key    = "state"
    region = "us-west-2"
    use_lockfile = true
  }

  required_version = "~> 1.14"
}

provider "aws" {
  region = "us-west-2"
}

# We use a remote state data source to look up the Amplify app ID created in 
# the prod module, which is needed to set up branch previews in the deploy 
# module. This is necessary because the prod module is only applied in the 
# default workspace, while the deploy module is applied in all workspaces.
data "terraform_remote_state" "prod_lookup" {
  backend = "s3"
  workspace = "default"

  config = {
    bucket = "laprogram-terraform-state"
    key    = "state"
    region = "us-west-2"
  }
}

locals {
  amplify_id = terraform.workspace == "default" ? data.terraform_remote_state.prod_lookup.outputs.amplify_id : module.prod[0].amplify_id
}

module "deploy" {
  source = "./modules/deploy"

  cors_domain = terraform.workspace == "default" ? var.cors_domain : replace(var.cors_domain_amplify, "main", var.branch_name)
  amplify_id = local.amplify_id
  branch_name = var.branch_name
}

module "prod" {
  source = "./modules/prod"
  count  = terraform.workspace == "default" ? 1 : 0

  application_tag = module.deploy.application_tag
  api_id          = module.deploy.api_id
  api_stage       = module.deploy.api_stage
  domain           = var.domain 
  api_domain = var.api_domain
}
