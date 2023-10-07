import path = require('path');

import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { ReceiptRuleSet, TlsPolicy } from 'aws-cdk-lib/aws-ses';
import { S3, Lambda, LambdaInvocationType } from 'aws-cdk-lib/aws-ses-actions';
import { Construct } from 'constructs';

import { keysExist } from '../src/utils/object';

export class SesForwarderStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const missingEnvVar = keysExist(
      process.env,
      'FROM_ADDRESS',
      'TO_ADDRESS',
      'SES_REGION',
      'S3_REGION'
    );
    if (missingEnvVar) {
      throw new Error(
        `Environment variable "${missingEnvVar}" must be defined. It can be defined as a project file in ".env.local"`
      );
    }

    const mailStorageBucket = new Bucket(this, 'MailStorageBucket', {
      versioned: false,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      lifecycleRules: [
        {
          expiration: Duration.days(7),
        },
      ],
    });

    const forwardEmailLambda = new NodejsFunction(
      this,
      'SesEmailForwarderLambda',
      {
        entry: path.join(__dirname, './../src/handler.ts'),
        runtime: Runtime.NODEJS_18_X,
        handler: 'handler',
        logRetention: RetentionDays.ONE_DAY,
        timeout: Duration.seconds(8),
        memorySize: 128,
        bundling: {
          externalModules: ['@aws-sdk/*'],
          tsconfig: path.join(__dirname, './../tsconfig.json'),
          minify: true,
        },
        environment: {
          FROM_ADDRESS: process.env.FROM_ADDRESS!,
          TO_ADDRESS: process.env.TO_ADDRESS!,
          SES_REGION: process.env.SES_REGION!,
          S3_REGION: process.env.S3_REGION!,

          S3_BUCKET_NAME: mailStorageBucket.bucketName,

          S3_BUCKET_KEY_PREFIX: process.env.S3_BUCKET_KEY_PREFIX ?? '',
          DEBUG: process.env.DEBUG ?? '',
        },
      }
    );
    mailStorageBucket.grantRead(forwardEmailLambda);
    forwardEmailLambda.addToRolePolicy(
      new PolicyStatement({
        actions: ['ses:SendEmail', 'ses:SendRawEmail'],
        resources: ['*'],
        effect: Effect.ALLOW,
      })
    );

    const recipients = process.env.SES_RULE_RECEPIENTS?.split(',') ?? undefined;

    new ReceiptRuleSet(this, 'SaveS3InvokeForwardLambdaRuleSet', {
      rules: [
        {
          recipients,
          tlsPolicy: TlsPolicy.OPTIONAL,
          scanEnabled: true,
          actions: [
            new S3({
              bucket: mailStorageBucket,
              objectKeyPrefix: process.env.S3_KEY_PREFIX,
            }),
            new Lambda({
              function: forwardEmailLambda,
              invocationType: LambdaInvocationType.EVENT,
            }),
          ],
        },
      ],
    });
  }
}
