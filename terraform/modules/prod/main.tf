terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.34"
    }
  }

  required_version = "~> 1.14"
}

locals {
  api_domain = "${var.api_subdomain}.${var.domain}"
}