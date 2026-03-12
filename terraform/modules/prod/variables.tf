variable "application_tag" {
  type     = map(string)
  nullable = false
}

variable "domain" {
  type     = string
  nullable = false
}

variable "api_domain" {
  type     = string
  nullable = false
}

variable "api_id" {
  type     = string
  nullable = false
}

variable "api_stage" {
  type     = string
  nullable = false
}