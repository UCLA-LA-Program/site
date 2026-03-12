# IAM role for lambda execution
resource "aws_iam_role" "lambda" {
  name = "${local.resource_prefix}_lambda"
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
resource "aws_iam_role_policy_attachment" "lambda_log" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# package all functions as zips
data "archive_file" "lambda_zips" {
  for_each    = local.lambda_names
  type        = "zip"
  source_file = "../../backend/${each.key}"
  output_path = "../../backend/${each.key}.zip"
}

# define all lambda functions
resource "aws_lambda_function" "api" {
  for_each = local.lambda_names

  function_name = "${local.resource_prefix}_${each.value}"
  tags          = local.application_tag
  role          = aws_iam_role.lambda.arn

  filename    = data.archive_file.lambda_zips[each.key].output_path
  code_sha256 = data.archive_file.lambda_zips[each.key].output_base64sha256
  handler     = "${each.value}.lambda_handler"
  runtime     = "python3.14"
  timeout     = 10
}

# define log group for each lambda
resource "aws_cloudwatch_log_group" "api" {
  for_each = aws_lambda_function.api

  name = "/aws/lambda/${each.value.function_name}"
  tags = local.application_tag

  retention_in_days = 30
}

# allow API Gateway to call lambdas
resource "aws_lambda_permission" "api" {
  for_each = local.lambda_names

  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api[each.key].function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}