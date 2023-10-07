import { SESEvent } from 'aws-lambda';

import { EventContext } from '../config';

export interface ValidateEventParams {
  log: EventContext['log'];
  event: SESEvent;
}

/**
 *
 * @param param0
 * @returns SES message from record
 */
export function validateEvent({ log, event }: ValidateEventParams) {
  if (event.Records === undefined || event.Records.length === 0) {
    log({
      level: 'error',
      message: 'validateEvent(), received invalid SES event',
      event: JSON.stringify(event),
    });
    throw new Error('Invalid SES event');
  }
}
