output amplify_id {
  value       = terraform.workspace == "default" ? module.prod[0].amplify_id : null
}
