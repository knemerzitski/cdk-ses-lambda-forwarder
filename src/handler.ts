import { S3Client } from '@aws-sdk/client-s3';
import { SESv2Client } from '@aws-sdk/client-sesv2';
import { SESHandler } from 'aws-lambda';
import debug from 'debug';

import { EventContext, EventContextOverride } from './config';
import { fetchMessage } from './pipe/fetchMessage';
import { parseRawEmail } from './pipe/parseRawEmail';
import { sendEmail } from './pipe/sendEmail';
import { validateEvent } from './pipe/validateEvent';
import { validateRecord } from './pipe/validateRecord';
import { wrapEmailAsAttachment } from './pipe/wrapEmailAsAttachment';
import { buildSendEmailCommandInput } from './simpleEmail';

function createLogger() {
  const log = debug('aws-cdk-ses-forwarder');
  return (message: unknown, obj?: unknown) => {
    if (typeof message === 'string') {
      if (obj) {
        return log(`${message} %j`, obj);
      } else {
        return log(message);
      }
    } else {
      return log(`%j`, message);
    }
  };
}

let s3: S3Client | undefined;
let ses: SESv2Client | undefined;

export function defaultConfig(): EventContextOverride {
  if (!s3) {
    s3 = new S3Client({
      region: process.env.S3_REGION,
    });
  }
  if (!ses) {
    ses = new SESv2Client({
      region: process.env.SES_REGION,
    });
  }
  return {
    config: {
      fromAddress: process.env.FROM_ADDRESS!,
      toAddress: process.env.TO_ADDRESS!,
      emailBucket: process.env.S3_BUCKET_NAME!,
      emailBucketKeyPrefix: process.env.S3_KEY_PREFIX ?? '',
    },
    log: createLogger(),
    s3,
    ses,
  };
}

export const createHandler: (override: EventContextOverride) => SESHandler = (
  override
) => {
  return async (event, context) => {
    const ctx: EventContext = {
      ...override,
      event,
      context,
    };

    try {
      validateEvent({ ...ctx });

      ctx.log({
        level: 'info',
        message: `Processing ${event.Records.length} event record(s)`,
      });

      const recordPromises = event.Records.map(async (record) => {
        try {
          validateRecord({ ...ctx, record });

          const rawEmail = await fetchMessage({
            ...ctx,
            mail: record.ses.mail,
          });
          const emailInfo = parseRawEmail({ ...ctx, rawEmail });

          const emailAsAttachment = wrapEmailAsAttachment({
            ...ctx,
            emailInfo,
          });

          const commandInput = buildSendEmailCommandInput(
            emailAsAttachment,
            ctx.boundaryGenerator
          );

          await sendEmail({
            ...ctx,
            input: commandInput,
          });
        } catch (err) {
          ctx.log({
            level: 'error',
            message: `Error when processing record. ${(err as Error).message}`,
            error: err,
            stack: (err as Error).stack,
          });
        }
      });

      await Promise.all(recordPromises);
    } catch (err) {
      override.log({
        level: 'error',
        message: (err as Error).message,
        error: err,
        stack: (err as Error).stack,
      });
      throw err;
    }
  };
};

export const handler = createHandler(defaultConfig());
