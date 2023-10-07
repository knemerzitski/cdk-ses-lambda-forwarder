import { EventContext } from '../config';
import { SimpleEmail } from '../simpleEmail';
import { sanitizeFileNameNoExt } from '../utils/string';

import { EmailInfo } from './parseRawEmail';

export interface WrapEmailAsAttachmentParams {
  config: EventContext['config'];
  log: EventContext['log'];
  emailInfo: EmailInfo;
}

export function wrapEmailAsAttachment({
  config,
  log,
  emailInfo: { source, headers },
}: WrapEmailAsAttachmentParams): SimpleEmail {
  log({
    level: 'info',
    message: `Wrapping email as an attachment from ${headers.from} to ${config.toAddress}`,
  });
  const attachmentName = sanitizeFileNameNoExt(headers.subject, 64);

  const subject = `[SES Forward] ${headers.subject} | From: ${headers.from}`;
  const message = `The forwarded message is in the attachment "${attachmentName}.eml"`;

  return {
    headers: {
      from: {
        address: config.fromAddress,
      },
      to: {
        address: config.toAddress,
      },
      subject: subject,
    },
    body: [
      {
        content: message,
      },
      {
        headers: {
          'Content-Type': `application/octet-stream; name="${attachmentName}.eml"`,
          'Content-Disposition': `attachment; filename="${attachmentName}.eml"`,
        },
        content: source,
      },
    ],
  };
}
