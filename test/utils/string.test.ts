import assert from 'assert';

import {
  isAsciiString,
  sanitizeFileNameNoExt,
  wrapString,
} from '../../src/utils/string';

describe('wrapString', () => {
  it('wraps string leaving remainder on the next line', () => {
    const input = 'somewhat long string and string';
    const expected = 'somew\nhat l\nong s\ntring\n and \nstrin\ng';

    assert.strictEqual(wrapString(input, 5), expected);
  });
});

describe('isAsciiString', () => {
  it('detects ascii string correctly', () => {
    assert.strictEqual(
      isAsciiString('almost non ascii\u007f'),
      true,
      'contains last character in ascii'
    );
    assert.strictEqual(
      isAsciiString('non ascii\u0080'),
      false,
      'one index outside ascii bounds'
    );
  });
});

describe('sanitizeFileNameNoExt', () => {
  it('removed not allowed characters in filename', () => {
    assert.strictEqual(sanitizeFileNameNoExt('valid_ name'), 'valid_ name');
    assert.strictEqual(
      sanitizeFileNameNoExt('illegal_chars @!>$356@name--'),
      'illegal_chars 356name--'
    );
  });
});
