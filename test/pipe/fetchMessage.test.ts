import assert from 'assert';

import { GetObjectCommandInput } from '@aws-sdk/client-s3';

import { FetchMessageParams, fetchMessage } from '../../src/pipe/fetchMessage';
import { newMockS3ClientHelper } from '../mocks/s3Client';

describe('fetchMessage', () => {
  it('uses s3 sends command with correct arguments', async () => {
    let sentInput = {} as GetObjectCommandInput;

    const args = {
      config: {
        emailBucket: 'my-s3-bucket',
        emailBucketKeyPrefix: 'random-prefix/',
      },
      mail: {
        messageId: 'some-message-id',
      },
      s3: newMockS3ClientHelper({
        getObjectInputHandler(input) {
          sentInput = input;
        },
      }),
      log: () => {},
    } as unknown as FetchMessageParams;

    await fetchMessage(args);

    assert.strictEqual(sentInput.Bucket, 'my-s3-bucket');
    assert.strictEqual(sentInput.Key, 'random-prefix/some-message-id');
  });

  it('emailBucketKeyPrefix is optional', async () => {
    let sentInput = {} as GetObjectCommandInput;

    const args = {
      config: {
        emailBucket: 'ignore',
      },
      mail: {
        messageId: 'some-message-id',
      },
      s3: newMockS3ClientHelper({
        getObjectInputHandler(input) {
          sentInput = input;
        },
      }),
      log: () => {},
    } as unknown as FetchMessageParams;

    await fetchMessage(args);

    assert.strictEqual(sentInput.Key, 'some-message-id');
  });

  it('s3 returns body string', async () => {
    const args = {
      config: {
        emailBucket: 'ignore',
      },
      mail: {
        messageId: 'ignore',
      },
      s3: newMockS3ClientHelper({
        getObjectOutput: 'this is a fake message',
      }),
      log: () => {},
    } as unknown as FetchMessageParams;

    const message = await fetchMessage(args);

    assert.strictEqual(message, 'this is a fake message');
  });
});
