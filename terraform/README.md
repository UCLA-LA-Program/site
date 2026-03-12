# Deployment

The LA Program web-app uses Terraform to manage deployment of backend resources through AWS. This makes it easy to provision new resources in a programatic way and makes it less likely to make breaking changes to infrastructure that is critical to LA Program functioning but does create certain pain points.

This file is used to provide an overview of the technical decisions behind the infrastructure chosen. Please update it when making changes to files in this directory.

> [!TIP]
> Please read about Terraform online before making *any* changes to this folder. Be sure you understand what AWS resources you are using.

## Disclaimer

> [!CAUTION]
> You **should not** access Terraform through CLI commands on your computer.
>
> You also **should not** change AWS configurations through the console unless you are 100% sure of what you are doing.

Note that any changes through the AWS console will be reverted by Terraform anyways unless Terraform does not own the resource (and Terraform should own all LA Program resources).

## Workflow

All Terraform/AWS configuration changes should be done through Github Workflows.

To make changes:

- Create a PR to the `main` branch of the respository with your code/Terraform changes
- Check the comments, as Github Workflows will use Terraform to:
  - provision a copy of any resources that can be duplicated (more on this below) and deploy a testing version of the site using Vercel (this is managed through the Vercel dashboard; Terraform only manages backend deployment)
  - provide a plan of what Terraform changes would be made upon merge to `main`
- Test and iterate
- Deploy to production by merging the PR (**please examine the Terraform plan before doing so if any changes will be made**)

> [!WARNING]
> Note that the behavior of test deployments will change depending on what module you are making edits to. Please read the below section for more information.

## Modules

The terraform configuration is split into two modules.

### `deploy`

The `deploy` module contains resources that *can* be duplicated upon pull-request for testing purposes. `deploy` should not depend on `prod`.

- `api_gateway.tf` provisions a new API Gateway for every deployment, allowing us to connect to each Lambda function through one URL
- `lambda.tf` provisions all Lambda functions by processing each python file in the `backend` directory of the respository
- `main.tf` provisions a Service Catalog application whose tag is used to tag LA Program resources

### `prod`

The `prod` module contains resources meant to be updated only when the production web-app is re-deployed. Edits to this module should be done with extreme care as these files mainly deal with the production domain name.

- `api_gateway.tf` configures the production API Gateway to serve on the `api.` subdomain of the site
- `domain.tf` provisions certificate information for the API route

## Configurations

There are two Terraform configurations used. The configuration in the `release` folder is the production configuration and only uses the `default` workspace. The configuration in the `dev` folder are shorter-lived PR preview deployments.

Upon PR, a new workspace (named something like `pr150` if we were dealing with PR number 150) of the `dev` configuration is created and deployed for testing purposes.

Upon merge to `main`, we redeploy the `release` configuration and delete the workspace of the `dev` configuration we just merged.

Note that the `dev` configuration does not include the `prod` module.

> [!CAUTION]
> Note that PR previews do not redeploy `prod`. As such, all changes to `prod` are blind and should be done extremely carefully. This also indicates that generally speaking no resources related to data integrity should live in `prod`.

## Remote State/AWS Authentication

Terraform state is stored remotely in AWS S3. The AWS access credentials used for for both access to this bucket and to generally apply Terraform changes are stored in Github Secrets.
