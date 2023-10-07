import assert from 'assert';

import { parseRawEmail } from '../../src/pipe/parseRawEmail';

describe('parseRawEmail', () => {
  it('email with all headers present', () => {
    const rawEmail = `
Received: from abc.smtp-out.amazonses.com (123.45.67.89) by in.example.com (87.65.43.210); Fri, 17 Dec 2010 14:26:22
From: "Andrew" <andrew@example.com>;
To: "Bob" <bob@example.com>
Date: Fri, 17 Dec 2010 14:26:21 -0800
Subject: Hello
Message-ID: <61967230-7A45-4A9D-BEC9-87CBCF2211C9@example.com>
Accept-Language: en-US
Content-Language: en-US
Content-Type: text/plain; charset="us-ascii"
Content-Transfer-Encoding: quoted-printable
MIME-Version: 1.0

Hello, I hope you are having a good day.

-Andrew
    `.trim();

    assert.deepStrictEqual(parseRawEmail({ rawEmail }), {
      source: rawEmail,
      headers: {
        subject: 'Hello',
        from: '"Andrew" <andrew@example.com>;',
      },
    });
  });

  it('email with missing headers returns empty strings', () => {
    const rawEmail = `
Received: from abc.smtp-out.amazonses.com (123.45.67.89) by in.example.com (87.65.43.210); Fri, 17 Dec 2010 14:26:22
To: "Bob" <bob@example.com>
Date: Fri, 17 Dec 2010 14:26:21 -0800
Message-ID: <61967230-7A45-4A9D-BEC9-87CBCF2211C9@example.com>
Accept-Language: en-US
Content-Language: en-US
Content-Type: text/plain; charset="us-ascii"
Content-Transfer-Encoding: quoted-printable
MIME-Version: 1.0

Hello, I hope you are having a good day.

-Andrew
    `.trim();

    assert.deepStrictEqual(parseRawEmail({ rawEmail }), {
      source: rawEmail,
      headers: {
        subject: '',
        from: '',
      },
    });
  });

  it('can parse raw email case insensitive', () => {
    const rawEmail = `
Received: from abc.smtp-out.amazonses.com (123.45.67.89) by in.example.com (87.65.43.210); Fri, 17 Dec 2010 14:26:22
From: "Andrew" <andrew@example.com>;
To: "Bob" <bob@example.com>
Date: Fri, 17 Dec 2010 14:26:21 -0800
subject: Hello
Message-ID: <61967230-7A45-4A9D-BEC9-87CBCF2211C9@example.com>
Accept-Language: en-US
Content-Language: en-US
Content-Type: text/plain; charset="us-ascii"
Content-Transfer-Encoding: quoted-printable
MIME-Version: 1.0

Hello, I hope you are having a good day.

-Andrew
    `.trim();

    assert.deepStrictEqual(parseRawEmail({ rawEmail }), {
      source: rawEmail,
      headers: {
        subject: 'Hello',
        from: '"Andrew" <andrew@example.com>;',
      },
    });
  });
});
