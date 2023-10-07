import { randomUUID } from 'crypto';

import { SendEmailCommandInput } from '@aws-sdk/client-sesv2';

import { mapValues, trimLowerCaseKeys } from './utils/object';
import { isAsciiString, wrapString } from './utils/string';

export type Headers = Record<string, unknown>;

export interface SimpleEmail {
  headers: {
    from: EmailAddress;
    to: EmailAddress;
    subject: string;
  } & Headers;
  body: [SimpleEmailBody, ...SimpleEmailBody[]];
}

export interface SimpleEmailBody {
  headers?: Headers;
  content: string;
}

export interface EmailAddress {
  name?: string;
  address: string;
}

export function encodeHeaderValue(headerValue: string) {
  if (isAsciiString(headerValue)) return headerValue;
  return `=?utf-8?B?${Buffer.from(headerValue).toString('base64')}?=`;
}

export function encodeEmailAddress({ name, address }: EmailAddress): string {
  return [name ?? '', `<${address.replace('<', '\\<')}>`]
    .filter((s) => s.trim().length)
    .map((s) => encodeHeaderValue(s))
    .join(' ');
}

export function encodeHeaderValues(headers: Headers): Record<string, string> {
  return mapValues(headers, (v) => encodeHeaderValue(String(v)));
}

export function headersToString(headers: Record<string, string>): string {
  return Object.entries(headers)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
}

export function encodeContent(content: string): string {
  return Buffer.from(content).toString('base64');
}

export function generateRandomBoundary() {
  return Buffer.from(randomUUID()).toString('base64');
}

export function buildRawEmailString(
  email: SimpleEmail,
  boundaryGenerator: () => string = generateRandomBoundary
): string {
  const emailRows = [];

  // Sanitize and encode headers
  const emailHeaders = encodeHeaderValues(trimLowerCaseKeys(email.headers));
  emailHeaders.from = encodeEmailAddress(email.headers.from);
  emailHeaders.to = encodeEmailAddress(email.headers.to);

  // Boundary helpers
  const beforeMimeHeaderPart: string[] = [];
  const endPart: string[] = [];

  // Add multipart if there is at least 2 body entries
  const isMultipart = email.body.length > 1;
  if (isMultipart) {
    const boundary = boundaryGenerator();
    beforeMimeHeaderPart.push(`\n--${boundary}`);
    endPart.push(`\n--${boundary}--`);
    emailHeaders['content-type'] = `multipart/mixed; boundary="${boundary}"`;
  }
  emailRows.push(headersToString(emailHeaders));

  // Turn email body into raw string
  const rawBody = email.body
    .map(({ headers, content }) => {
      const tmpHeaders = headers
        ? encodeHeaderValues(trimLowerCaseKeys(headers))
        : {};
      tmpHeaders['content-type'] = 'text/plain; charset="utf-8"';
      tmpHeaders['content-transfer-encoding'] = 'base64';

      return [
        ...beforeMimeHeaderPart,
        headersToString(tmpHeaders),
        '',
        wrapString(encodeContent(content), 76),
      ].join('\n');
    })
    .join('\n');
  emailRows.push(rawBody);
  emailRows.push(...endPart);

  return emailRows.join('\n').trim();
}

export function buildSendEmailCommandInput(
  email: SimpleEmail,
  boundaryGenerator?: () => string
): SendEmailCommandInput {
  const rawEmailData = buildRawEmailString(email, boundaryGenerator);

  return {
    Content: {
      Raw: {
        Data: Buffer.from(rawEmailData, 'utf-8'),
      },
    },
    FromEmailAddress: email.headers.from.address,
    Destination: {
      ToAddresses: [email.headers.to.address],
    },
  };
}
