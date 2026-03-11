output "application_tag" {
  value = local.application_tag
}

output "api_id" {
  value = aws_apigatewayv2_api.api.id
}

output "api_stage" {
  value = aws_apigatewayv2_stage.api.id
}