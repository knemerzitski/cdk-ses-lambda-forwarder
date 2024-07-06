# AWS CDK SES Forwarder

A simple CDK deployable code to forward all incomding SES emails to an existing mailbox as an attachment.

Email is constructed directly without using additional mail modules which is limiting but lightweight.

# Prerequisites

- Must have an existing verified domain in AWS SES where CDK App is deployed.
- Once deployed, you must activate created ruleset manually in SES console.

# Configuration

Prior to deploying CDK, it can be configured through environment variables.
By default file `.env.local` is read.

Example `.env.local`

```
# Domains or addresses to catch emails from for forwarding. Comma separated list.
SES_RULE_RECIPIENTS=mydomain.com,mydomain2.com,specific@mydomain.com

SES_REGION=eu-central-1

S3_REGION=eu-central-1

# [Optional] S3 bucket prefix where emails are stored
S3_BUCKET_KEY_PREFIX=mailbox/

# Who sends/forwards the email
FROM_ADDRESS=ses@mydomain.com

# Emails are sent here
TO_ADDRESS=name@mymail.com

# [Optional] Debugging
DEBUG=aws-cdk-ses-forwarder
```

By default emails are stored in S3 bucket for 7 days. It can be changed directly in CDK code.
