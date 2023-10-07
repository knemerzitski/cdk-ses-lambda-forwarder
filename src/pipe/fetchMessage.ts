import { GetObjectCommand } from '@aws-sdk/client-s3';
import { SESMail } from 'aws-lambda';

import { EventContext } from '../config';

export interface FetchMessageParams {
  config: EventContext['config'];
  log: EventContext['log'];
  s3: EventContext['s3'];
  mail: SESMail;
}

export async function fetchMessage({
  s3,
  log,
  config,
  mail,
}: FetchMessageParams): Promise<string> {
  const objectKey = (config.emailBucketKeyPrefix ?? '') + mail.messageId;

  log({
    level: 'info',
    message: `Fetching object from s3://${config.emailBucket}/${objectKey}`,
  });

  try {
    const out = await s3.send(
      new GetObjectCommand({
        Bucket: config.emailBucket,
        Key: objectKey,
      })
    );

    const body = out.Body?.transformToString();
    if (!body) {
      throw new Error('S3 object body is empty.');
    }
    return body;
  } catch (err) {
    log({
      level: 'error',
      message: 'GetObjectCommand() threw error.',
      error: err,
      stack: (err as Error).stack,
    });
    throw new Error('Failed to fetch object body from S3.');
  }
}
