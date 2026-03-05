resource "aws_amplify_app" "frontend-app" {
  name = "la-program-frontend-app"
  repository = "https://github.com/UCLA-LA-Program/site"
  tags = local.application_tag

  # access_token = "GITHUB_ACCESS_TOKEN"
  # access_token is required for setup and can be deleted after amplify app is created
  # refer to https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/amplify_app#repository-with-tokens
}