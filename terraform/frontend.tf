# IAM role for Amplify deployment
resource "aws_iam_role" "amplify_service_role" {
  name = "la_program_amplify_service_role"
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
  role       = aws_iam_role.amplify_service_role.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess-Amplify"
}

# deploys frontend React SPA using Amplify Deploy
resource "aws_amplify_app" "frontend_app" {
  name                 = "la_program_frontend_app"
  repository           = "https://github.com/UCLA-LA-Program/site"
  tags                 = local.application_tag
  iam_service_role_arn = aws_iam_role.amplify_service_role.arn


  # access_token = ""
  # to connect the amplify app to the site repository:
  # generate some personal access token to fill the above out and allow an initial terraform apply
  # refer here: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/amplify_app.html
  # once the Amplify app is created, navigate to:
  # Amplify console -> App settings -> Branch settings -> Reconnect Repository -> add the app to the repository
  # the access token can be deleted after this process and terraform reapplied safely

  enable_auto_branch_creation = true
  enable_branch_auto_build    = true
  enable_branch_auto_deletion = true

  auto_branch_creation_patterns = [
    "*",
    "*/**",
  ]
}

resource "aws_amplify_branch" "frontend_app_main_branch" {
  app_id                 = aws_amplify_app.frontend_app.id
  branch_name            = "main"
  framework              = "React"
  stage                  = "PRODUCTION"
  enable_skew_protection = true
}