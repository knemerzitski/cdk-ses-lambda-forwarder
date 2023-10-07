import assert from 'assert';

import { SendEmailCommandInput } from '@aws-sdk/client-sesv2';

import { SendEmailParams, sendEmail } from '../../src/pipe/sendEmail';
import { newMockSesClientHelper } from '../mocks/sesClient';

describe('sendEmail', () => {
  it('calls ses client with the input', async () => {
    let sentInput = {} as SendEmailCommandInput;

    const args = {
      input: {
        Content: {
          Raw: {
            Data: Buffer.from('hi', 'utf-8'),
          },
        },
        FromEmailAddress: 'from@local',
        Destination: {
          ToAddresses: ['to@local'],
        },
      },
      ses: newMockSesClientHelper({
        sendEmailInputHandler(input) {
          sentInput = input;
        },
      }),
      log: () => {},
    } as unknown as SendEmailParams;

    await sendEmail(args);

    assert.strictEqual(sentInput, args.input);
  });
});
