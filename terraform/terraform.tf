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

  required_version = ">= 1.14"
}
