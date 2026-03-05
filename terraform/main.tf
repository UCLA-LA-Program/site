provider "aws" {
  region = "us-west-2"
}

resource "aws_servicecatalogappregistry_application" "application" {
  name = "la-program-application"
}

locals {
  application_tag = aws_servicecatalogappregistry_application.application.application_tag
}
