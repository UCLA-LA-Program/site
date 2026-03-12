# set up branch preview 
resource "aws_amplify_branch" "branch" {
  count = terraform.workspace == "default" ? 0 : 1

  app_id                 = var.amplify_id
  branch_name            = var.branch_name
  framework              = "Next.js"
  stage                  = "DEVELOPMENT"
  enable_skew_protection = true
  enable_auto_build      = true

  environment_variables = {
    API_URL = aws_apigatewayv2_api.api.api_endpoint
  }

  # trigger initial build when creating for the first time
  provisioner "local-exec" {
    command = "aws amplify start-job --app-id ${var.amplify_id} --branch-name ${var.branch_name} --job-type RELEASE"
  }
}