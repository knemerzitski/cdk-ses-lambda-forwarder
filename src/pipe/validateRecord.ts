import { SESEventRecord } from 'aws-lambda';

import { EventContext } from '../config';

export interface ValidateRecordParams {
  log: EventContext['log'];
  record: SESEventRecord;
}

/**
 *
 * @param param0
 * @returns SES message from record
 */
export function validateRecord({ log, record }: ValidateRecordParams) {
  if (record.eventSource !== 'aws:ses' || record.eventVersion !== '1.0') {
    log({
      level: 'error',
      message:
        'validateRecord() received invalid SES record (check eventSource and eventVersion).',
      record: JSON.stringify(record),
    });
    throw new Error('Invalid SES record');
  }
}
