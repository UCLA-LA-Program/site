provider "aws" {
  region = "us-west-2"
}

# app registry application created in order to tag everything for ease-of-visibility
resource "aws_servicecatalogappregistry_application" "application" {
  name = "la_program_application"
}

locals {
  # application tag to apply to all resources created
  application_tag = aws_servicecatalogappregistry_application.application.application_tag

  # paths and names (stripped of .py) of lambda functions
  lambda_paths = fileset("../backend", "*.py")
  lambda_names = { for path in local.lambda_paths : path => trimsuffix(path, ".py") }
}
