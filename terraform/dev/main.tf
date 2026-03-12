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
    key    = "dev"
    region = "us-west-2"
    use_lockfile = true
  }

  required_version = "~> 1.14"
}

provider "aws" {
  region = "us-west-2"
}

# We use a remote state data source to look up the Amplify app ID created in 
# the release config, which is needed to set up branch previews in the dev 
# config. This is necessary because the prod module is only applied in the 
# release config, while the deploy module is applied in all configurations.
data "terraform_remote_state" "release" {
  backend = "s3"
  workspace = "default"

  config = {
    bucket = "laprogram-terraform-state"
    key    = "release"
    region = "us-west-2"
  }
}

locals {
  amplify_id = data.terraform_remote_state.release.outputs.amplify_id 
  cors_domain = "https://${var.branch_name}.${local.amplify_id}.amplifyapp.com"
}

module "deploy" {
  source = "../modules/deploy"

  cors_domain = local.cors_domain
  amplify_id = local.amplify_id
  branch_name = var.branch_name
}