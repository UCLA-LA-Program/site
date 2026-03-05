# IAM role for lambda execution
resource "aws_iam_role" "lambda_role" {
  name = "la_program_lambda_role"
  tags = local.application_tag

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Effect = "Allow",
        Principal = {
          Service = "lambda.amazonaws.com"
        },
      },
    ],
  })
}

# allow lambdas to write to logs
resource "aws_iam_role_policy_attachment" "lambda_role_attachment" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# package all functions as zips
data "archive_file" "lambda_zips" {
  for_each    = local.lambda_paths
  type        = "zip"
  source_file = "../backend/${each.key}"
  output_path = "../backend/${each.key}.zip"
}

# define all lambda functions
resource "aws_lambda_function" "lambda_functions" {
  for_each = local.lambda_paths

  function_name = "la_program_${local.lambda_names[each.key]}"
  tags          = local.application_tag
  role          = aws_iam_role.lambda_role.arn

  filename    = data.archive_file.lambda_zips[each.key].output_path
  code_sha256 = data.archive_file.lambda_zips[each.key].output_base64sha256
  handler     = "${local.lambda_names[each.key]}.lambda_handler"
  runtime     = "python3.14"
  timeout     = 10
}

# define log group for each lambda
resource "aws_cloudwatch_log_group" "lambda_logs" {
  for_each = aws_lambda_function.lambda_functions

  name = "/aws/lambda/${each.value.function_name}"
  tags = local.application_tag

  retention_in_days = 30
}
