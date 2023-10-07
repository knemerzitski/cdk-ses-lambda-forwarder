import assert from 'assert';

import {
  WrapEmailAsAttachmentParams,
  wrapEmailAsAttachment,
} from '../../src/pipe/wrapEmailAsAttachment';

describe('wrapEmailAsAttachment', () => {
  it('returns true for arrays', () => {
    const ctx = {
      config: {
        fromAddress: 'from@email',
        toAddress: 'to@email',
      },
      emailInfo: {
        source: 'raw email string to be attached',
        headers: {
          from: 'me@example',
          subject: 'Hi there',
        },
      },
      log: () => {},
    } as WrapEmailAsAttachmentParams;

    assert.deepStrictEqual(wrapEmailAsAttachment(ctx), {
      headers: {
        from: {
          address: 'from@email',
        },
        to: {
          address: 'to@email',
        },
        subject: '[SES Forward] Hi there | From: me@example',
      },
      body: [
        {
          content: 'The forwarded message is in the attachment "Hi there.eml"',
        },
        {
          headers: {
            'Content-Type': 'application/octet-stream; name="Hi there.eml"',
            'Content-Disposition': 'attachment; filename="Hi there.eml"',
          },
          content: 'raw email string to be attached',
        },
      ],
    });
  });
});
