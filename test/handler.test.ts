import assert from 'assert';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { GetObjectCommandInput } from '@aws-sdk/client-s3';
import { SendEmailCommandInput } from '@aws-sdk/client-sesv2';
import { Context, SESEvent } from 'aws-lambda';

import { createHandler } from '../src/handler';

import { newMockS3ClientHelper } from './mocks/s3Client';
import { newMockSesClientHelper } from './mocks/sesClient';

describe('createHandler', () => {
  it('processes event and sends email', async () => {
    let s3Input = {} as GetObjectCommandInput;
    let sesInput = {} as SendEmailCommandInput;

    const handler = createHandler({
      config: {
        fromAddress: 'ses@verifieddomain.com',
        toAddress: 'me@mymail.com',
        emailBucket: 'cdk-generated-bucket',
        emailBucketKeyPrefix: 'mailbox/',
      },
      log: () => {},
      boundaryGenerator() {
        return 'BOUNDARY_PART';
      },
      s3: newMockS3ClientHelper({
        getObjectInputHandler(input) {
          s3Input = input;
        },
        getObjectOutput: readFileSync(
          join(__dirname, './fixtures/valid-email.eml'),
          'utf-8'
        ),
      }),
      ses: newMockSesClientHelper({
        sendEmailInputHandler(input) {
          sesInput = input;
        },
      }),
    });

    const event = {
      Records: [
        {
          eventSource: 'aws:ses',
          eventVersion: '1.0',
          ses: {
            mail: {
              messageId: 'random-id',
            },
          },
        },
      ],
    } as SESEvent;

    await handler(event, {} as Context, () => {});

    writeFileSync(
      join(__dirname, './fixtures/valid-email-attached.eml'),
      sesInput.Content?.Raw?.Data?.toString() ?? ''
    ),
      // Assert event message id is used in S3
      assert.strictEqual(
        s3Input.Key,
        'mailbox/random-id',
        'S# GetObjectCommand did not received correct key (possibly invalid event message id?)'
      );

    // Assert correct email constructed for SendEmailCommandInput
    assert.deepStrictEqual(
      sesInput.Content?.Raw?.Data?.toString(),
      readFileSync(
        join(__dirname, './fixtures/valid-email-attached.eml'),
        'utf-8'
      ),
      'raw email data is different'
    );

    // Assert other parts of SendEmailCommandInput besides content
    sesInput.Content.Raw.Data = Buffer.from('[placeholder]', 'utf-8');
    assert.deepStrictEqual(
      sesInput,
      {
        Content: {
          Raw: {
            Data: Buffer.from('[placeholder]', 'utf-8'),
          },
        },
        FromEmailAddress: 'ses@verifieddomain.com',
        Destination: {
          ToAddresses: ['me@mymail.com'],
        },
      },
      'addresses are different'
    );
  });
});
