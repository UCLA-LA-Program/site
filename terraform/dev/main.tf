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
    key          = "dev"
    region       = "us-west-2"
    use_lockfile = true
  }

  required_version = "~> 1.14"
}

provider "aws" {
  region = "us-west-2"
}

locals {
  # cors_domain = "https://dev.${terraform.workspace}.laprogramucla.com"
  # allow all origins for CORS for dev, since the frontend may be served from localhost
  cors_domain = "*"
}

module "deploy" {
  source = "../modules/deploy"

  cors_domain = local.cors_domain
}