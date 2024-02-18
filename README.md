# file-monitoring-api

## Description

This is a TypeScript powered REST API backend service to upload and monitor files to S3.

- platform: AWS
- language: TypeScript
- runtime/environment: NodeJS
- framewrok: serverless

### Start the service

To start the service locally:
`npm run start`

To deploy the service in AWS:
`npm run deploy`

To check the code linting:
`npm run lint`

To fix the issues with code linting:
`npm run lint:fix`

To check the code linting and fixing it automatically:
`npm run code-check`

### API Diagram

<img src="/src/resources/api-diagram.png" alt="API Diagram"/>

### App Integratioon

This backend service is integrated with the AWS Cognito for authorization. Only authenticated users can access the API. You can use the [User Onboarding API](https://github.com/mdrijwan/user-onboarding-api) to login and use the JWT token to invoke this service.

### Try the API

You can checkout the deployed API service here
[File Monitoring API](https://iuzgjowzdh.execute-api.us-east-1.amazonaws.com/dev/upload).
