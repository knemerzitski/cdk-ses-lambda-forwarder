import assert from 'assert';

import {
  keysExist,
  mapKeys,
  mapValues,
  trimLowerCaseKeys,
} from '../../src/utils/object';

describe('mapKeys', () => {
  it('maps empty object correctly', () => {
    const obj = {};
    assert.deepEqual(
      mapKeys(obj, (k) => k),
      obj
    );
  });

  it('maps keys shallow', () => {
    const obj = {
      one: 'value',
      two: {
        nested: 'value2',
      },
    };
    function mapper(key: string): string {
      return key + 'suffix';
    }
    const expectedObj = {
      onesuffix: obj.one,
      twosuffix: obj.two,
    };

    assert.deepStrictEqual(mapKeys(obj, mapper), expectedObj);
  });
});

describe('mapValues', () => {
  it('maps empty object correctly', () => {
    const obj = {};
    assert.deepEqual(
      mapValues(obj, (v) => v),
      obj
    );
  });

  it('maps values shallow', () => {
    const obj = {
      one: 'value',
      two: {
        nested: 'value2',
      },
    };
    function mapper(value: unknown): string {
      return typeof value === 'string' ? String(value) + 'suffix' : 'replaced';
    }
    const expectedObj = {
      one: 'valuesuffix',
      two: 'replaced',
    };

    assert.deepStrictEqual(mapValues(obj, mapper), expectedObj);
  });
});

describe('trimLowerCaseKeys', () => {
  it('lowercases and trims keys', () => {
    const obj = {
      '    UPPER  \n  ': 'space',
    };
    const expectedObj = {
      upper: 'space',
    };

    assert.deepStrictEqual(trimLowerCaseKeys(obj), expectedObj);
  });
  it('replaces by keeping later value', () => {
    const obj = {
      UPPER: 'space',
      upper: 'after',
    };
    const expectedObj = {
      upper: 'after',
    };

    assert.deepStrictEqual(trimLowerCaseKeys(obj), expectedObj);
  });
});

describe('keysExists', () => {
  it('returns missing key', () => {
    const obj = {
      a: 'value',
      b: 'value',
    };

    assert.strictEqual(keysExist(obj, 'a', 'd'), 'd');
  });
  it('returns undefined if all keys exist', () => {
    const obj = {
      a: 'value',
      b: 'value',
    };

    assert.strictEqual(keysExist(obj, 'a', 'b'), undefined);
  });
});
