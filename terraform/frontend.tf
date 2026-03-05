resource "aws_iam_role" "amplify-service-role" {
  name = "la-program-amplify-service-role"
  tags = local.application_tag

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Effect = "Allow",
        Principal = {
          Service = "amplify.amazonaws.com"
        },
      },
    ],
  })
}

resource "aws_iam_role_policy_attachment" "amplify_service_role_attachment" {
  role       = aws_iam_role.amplify-service-role.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess-Amplify"
}

resource "aws_amplify_app" "frontend-app" {
  name       = "la-program-frontend-app"
  repository = "https://github.com/UCLA-LA-Program/site"
  tags       = local.application_tag

  # access_token = ""
  # access_token is required for setup and can be deleted after amplify app is created
  # refer to https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/amplify_app#repository-with-tokens

  enable_auto_branch_creation = true
  enable_branch_auto_build    = true
  enable_branch_auto_deletion = true
  iam_service_role_arn        = aws_iam_role.amplify-service-role.arn
}

resource "aws_amplify_branch" "frontend-app-main-branch" {
  app_id                 = aws_amplify_app.frontend-app.id
  branch_name            = "main"
  framework              = "React"
  stage                  = "PRODUCTION"
  enable_skew_protection = true
}