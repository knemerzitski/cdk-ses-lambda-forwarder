import assert from 'assert';

import { SESEventRecord } from 'aws-lambda';

import {
  ValidateRecordParams,
  validateRecord,
} from '../../src/pipe/validateRecord';

describe('validateRecord', () => {
  it('throws error on invalid source', () => {
    const record = {
      eventSource: 'random',
      eventVersion: '1.0',
    } as SESEventRecord;

    const args = {
      log: () => {},
      record,
    };

    assert.throws(() => {
      validateRecord(args);
    });
  });

  it('throws error on invalid version', () => {
    const record = {
      eventSource: 'aws:ses',
      eventVersion: '5.0',
    } as SESEventRecord;

    const args = {
      log: () => {},
      record,
    } as ValidateRecordParams;

    assert.throws(() => {
      validateRecord(args);
    });
  });
});
