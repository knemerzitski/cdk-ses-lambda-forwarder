import { S3Client } from '@aws-sdk/client-s3';
import { SESv2Client } from '@aws-sdk/client-sesv2';
import { Context, SESEvent } from 'aws-lambda';

type Logger = typeof console.log;

interface Config {
  fromAddress: string;
  toAddress: string;
  emailBucket: string;
  emailBucketKeyPrefix: string;
}

interface Clients {
  log: Logger;
  boundaryGenerator?: () => string;
  ses: SESv2Client;
  s3: S3Client;
}

export interface EventContextOverride extends Clients {
  config: Config;
}

export interface EventContext extends EventContextOverride {
  event: SESEvent;
  context: Context;
}
