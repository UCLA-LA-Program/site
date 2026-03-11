terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.34"
    }

    archive = {
      source  = "hashicorp/archive"
      version = "2.7.1"
    }
  }

  required_version = "~> 1.14"
}

locals {
  # paths and names (stripped of .py) of lambda functions
  lambda_paths = fileset("../backend", "*.py")
  lambda_names = { for path in local.lambda_paths : path => trimsuffix(path, ".py") }

  application_tag = aws_servicecatalogappregistry_application.application.application_tag
}

# app registry application created in order to tag everything for ease-of-visibility
resource "aws_servicecatalogappregistry_application" "application" {
  name = "la_program_application"
}