#!/usr/bin/env node
import 'source-map-support/register';
import path from 'path';

import * as cdk from 'aws-cdk-lib';
import dotenv from 'dotenv';

import { SesForwarderStack } from './sesForwarderStack';

dotenv.config({ path: path.join(__dirname, './../.env.local') });

const app = new cdk.App();
new SesForwarderStack(app, 'SesForwarderStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
