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
    bucket       = "laprogram-terraform-state"
    key          = "release"
    region       = "us-west-2"
    use_lockfile = true
  }

  required_version = "~> 1.14"
}

provider "aws" {
  region = "us-west-2"
}

module "deploy" {
  source = "../modules/deploy"

  cors_domain = "https://www.laprogramucla.com"
  branch_name = "main"
  amplify_id  = module.prod.amplify_id
}

module "prod" {
  source = "../modules/prod"

  application_tag = module.deploy.application_tag
  api_id          = module.deploy.api_id
  api_stage       = module.deploy.api_stage
  domain          = "laprogramucla.com"
  api_domain      = "api.laprogramucla.com"
}
