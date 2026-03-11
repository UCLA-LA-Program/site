resource "aws_apigatewayv2_api" "api" {
  name          = "${local.resource_prefix}_api"
  tags          = local.application_tag
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = [
      var.cors_domain,
    ]
    allow_methods = [
      "*"
    ]
  }
}

resource "aws_apigatewayv2_integration" "api" {
  for_each = local.lambda_names

  api_id                 = aws_apigatewayv2_api.api.id
  integration_type       = "AWS_PROXY"
  integration_method     = "POST"
  integration_uri        = aws_lambda_function.api[each.key].invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "api" {
  for_each = local.lambda_names

  api_id    = aws_apigatewayv2_api.api.id
  route_key = "ANY /${each.value}"

  target = "integrations/${aws_apigatewayv2_integration.api[each.key].id}"
}

resource "aws_apigatewayv2_stage" "api" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "$default"
  auto_deploy = true
}