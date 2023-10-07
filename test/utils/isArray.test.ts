import assert from 'assert';

import { isArray } from '../../src/utils/isArray';

describe('isArray', () => {
  it('returns true for arrays', () => {
    assert.strictEqual(isArray([]), true);
    assert.strictEqual(isArray([1, 2, 3]), true);
  });
  it('returns false for everything except array', () => {
    assert.strictEqual(isArray(null), false);
    assert.strictEqual(isArray(5), false);
    assert.strictEqual(isArray('s'), false);
    assert.strictEqual(isArray({}), false);
    assert.strictEqual(isArray(Object.create({})), false);
    assert.strictEqual(isArray({ length: 0 }), false);
  });
});
