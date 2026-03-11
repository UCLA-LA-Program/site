# IAM role for Amplify Deploy
resource "aws_iam_role" "amplify" {
  name = "la_program_amplify"
  tags = var.application_tag

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

resource "aws_iam_role_policy_attachment" "amplify" {
  role       = aws_iam_role.amplify.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess-Amplify"
}

# deploys frontend Next.js SPA using Amplify Deploy
resource "aws_amplify_app" "frontend_app" {
  name                 = "la_program_frontend_app"
  repository           = "https://github.com/UCLA-LA-Program/site"
  tags                 = var.application_tag
  iam_service_role_arn = aws_iam_role.amplify.arn


  # access_token = ""
  # to connect the amplify app to the site repository:
  # generate some personal access token to fill the above out and allow an initial terraform apply
  # refer here: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/amplify_app.html
  # once the Amplify app is created, navigate to:
  # Amplify console -> App settings -> Branch settings -> Reconnect Repository -> add the app to the repository
  # the access token can be deleted after this process and terraform reapplied safely

  enable_auto_branch_creation = false

  custom_rule {
    source = "https://${var.domain}"
    status = "302"
    target = "https://www.${var.domain}"
  }
}

# set up production deployment through main branch
resource "aws_amplify_branch" "main" {
  app_id                 = aws_amplify_app.frontend_app.id
  branch_name            = "main"
  framework              = "Next.js"
  stage                  = "PRODUCTION"
  enable_skew_protection = true
  enable_auto_build = true

  environment_variables = {
    API_URL = var.api_domain
  }
}

# set up Amplify Deploy to serve production traffic through owned domain
resource "aws_amplify_domain_association" "frontend" {
  app_id      = aws_amplify_app.frontend_app.id
  domain_name = var.domain

  sub_domain {
    branch_name = aws_amplify_branch.main.branch_name
    prefix      = ""
  }

  sub_domain {
    branch_name = aws_amplify_branch.main.branch_name
    prefix      = "www"
  }
}