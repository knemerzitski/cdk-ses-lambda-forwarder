import { SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-sesv2';

import { EventContext } from '../config';

export interface SendEmailParams {
  ses: EventContext['ses'];
  log: EventContext['log'];
  input: SendEmailCommandInput;
}

export async function sendEmail({ ses, log, input }: SendEmailParams) {
  log({
    level: 'info',
    message: `Sending email from ${input.FromEmailAddress} to ${input.Destination?.ToAddresses}`,
  });

  try {
    const output = await ses.send(new SendEmailCommand(input));
    log({
      level: 'info',
      message: 'SES SendEmailCommand() successful.',
      output: output,
    });
  } catch (err) {
    log({
      level: 'error',
      message: 'SES SendEmailCommand() returned error.',
      error: err,
      stack: (err as Error).stack,
    });
  }
}
