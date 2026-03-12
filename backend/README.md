# Backend

## Technical Guide

All back-end API routes are deployed as AWS Lambdas (serverless functions). Each route is associated with exactly one `.py` file. These are served through an HTTP API using API Gateway.

For instance, creating an API on the `/test` route can be accomplished by creating a `test.py` file in the `backend` folder. Thus, each `.py` file needs to parse for HTTP method, etc, individually.

Please read the AWS documentation if you have questions after looking at existing routes. For reference:

- [Defining Python Lambda handlers](https://docs.aws.amazon.com/lambda/latest/dg/python-handler.html)
- [Lambda Payload Documentation](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html) - note: we use format 2.0

## AWS Resource Access

We need to support both production and test deployments on one codebase; this means that unless a resource is global (i.e. shared between production and test deployments), we can not completely hardcode information like database names.

To accomplish this, please: TODO
