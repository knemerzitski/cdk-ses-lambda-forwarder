import assert from 'assert';

import {
  buildRawEmailString,
  encodeEmailAddress,
  encodeHeaderValue,
} from '../src/simpleEmail';

describe('encodeHeaderValue', () => {
  it('does not encode ascii', () => {
    assert.strictEqual(encodeHeaderValue('aaaAbbb-ok'), 'aaaAbbb-ok');
  });

  it('encodes non-ascii to utf-8 base64 encoded', () => {
    assert.strictEqual(
      encodeHeaderValue('morežthanüasciiä'),
      '=?utf-8?B?bW9yZcW+dGhhbsO8YXNjaWnDpA==?='
    );
  });
});

describe('encodeEmailAddress', () => {
  it('create header value from email name and address', () => {
    assert.strictEqual(
      encodeEmailAddress({ name: 'myname', address: 'me@example.com' }),
      'myname <me@example.com>'
    );
  });

  it('escapes less than sign in address', () => {
    assert.strictEqual(
      encodeEmailAddress({ name: 'myname', address: 'me@exa<mple.com' }),
      'myname <me@exa\\<mple.com>'
    );
  });
});

describe('buildRawEmailString', () => {
  it('builds email with attachment in body', () => {
    function boundaryGenerator() {
      return 'BOUNDARY_PART';
    }

    assert.strictEqual(
      buildRawEmailString(
        {
          headers: {
            from: {
              address: 'from@email',
            },
            to: {
              address: 'to@email',
            },
            subject: '[SES Forward] Hi there (From: me@example)',
          },
          body: [
            {
              content:
                'The forwarded message is in the attachment "Hi there.eml"',
            },
            {
              headers: {
                'Content-Type': 'application/octet-stream; name="Hi there.eml"',
                'Content-Disposition': 'attachment; filename="Hi there.eml"',
              },
              content: 'raw email string to be attached',
            },
          ],
        },
        boundaryGenerator
      ),
      `
from: <from@email>
to: <to@email>
subject: [SES Forward] Hi there (From: me@example)
content-type: multipart/mixed; boundary="BOUNDARY_PART"

--BOUNDARY_PART
content-type: text/plain; charset="utf-8"
content-transfer-encoding: base64

VGhlIGZvcndhcmRlZCBtZXNzYWdlIGlzIGluIHRoZSBhdHRhY2htZW50ICJIaSB0aGVyZS5lbWwi

--BOUNDARY_PART
content-type: application/octet-stream; name="Hi there.eml"
content-disposition: attachment; filename="Hi there.eml"
content-transfer-encoding: base64

cmF3IGVtYWlsIHN0cmluZyB0byBiZSBhdHRhY2hlZA==

--BOUNDARY_PART--
`.trim()
    );
  });

  it('builds email with simple text body', () => {
    assert.strictEqual(
      buildRawEmailString({
        headers: {
          from: {
            address: 'from@email',
          },
          to: {
            address: 'to@email',
          },
          subject: 'simple text',
        },
        body: [
          {
            content: 'Hello world',
          },
        ],
      }),
      `
from: <from@email>
to: <to@email>
subject: simple text
content-type: text/plain; charset="utf-8"
content-transfer-encoding: base64

SGVsbG8gd29ybGQ=
`.trim()
    );
  });
});
