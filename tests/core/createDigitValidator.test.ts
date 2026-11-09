import { describe, expect, it } from 'vitest';
import { createDigitValidator } from '../../src/core/createDigitValidator';

describe('createDigitValidator', () => {
  it('accepts decimal digits', () => {
    const isDecimalDigit = createDigitValidator(10);

    expect(isDecimalDigit('0')).toBe(true);
    expect(isDecimalDigit('8')).toBe(true);
    expect(isDecimalDigit('9')).toBe(true);
  });

  it('rejects characters outside the decimal alphabet', () => {
    const isDecimalDigit = createDigitValidator(10);

    expect(isDecimalDigit('11')).toBe(false);
    expect(isDecimalDigit('a')).toBe(false);
    expect(isDecimalDigit('A')).toBe(false);
    expect(isDecimalDigit('-')).toBe(false);
    expect(isDecimalDigit('')).toBe(false);
  });

  it('accepts binary digits', () => {
    const isBinaryDigit = createDigitValidator(2);

    expect(isBinaryDigit('0')).toBe(true);
    expect(isBinaryDigit('1')).toBe(true);
  });

  it('rejects characters outside the binary alphabet', () => {
    const isBinaryDigit = createDigitValidator(2);

    expect(isBinaryDigit('2')).toBe(false);
    expect(isBinaryDigit('a')).toBe(false);
    expect(isBinaryDigit('A')).toBe(false);
    expect(isBinaryDigit('-')).toBe(false);
    expect(isBinaryDigit('')).toBe(false);
  });

  it('accepts octal digits', () => {
    const isOctalDigit = createDigitValidator(8);

    expect(isOctalDigit('0')).toBe(true);
    expect(isOctalDigit('7')).toBe(true);
  });

  it('rejects characters outside the octal alphabet', () => {
    const isOctalDigit = createDigitValidator(8);

    expect(isOctalDigit('8')).toBe(false);
    expect(isOctalDigit('a')).toBe(false);
    expect(isOctalDigit('A')).toBe(false);
    expect(isOctalDigit('-')).toBe(false);
    expect(isOctalDigit('')).toBe(false);
  });

  it('accepts hexadecimal digits', () => {
    const isHexDigit = createDigitValidator(16);

    expect(isHexDigit('0')).toBe(true);
    expect(isHexDigit('9')).toBe(true);
    expect(isHexDigit('a')).toBe(true);
    expect(isHexDigit('f')).toBe(true);
  });

  it('rejects characters outside the hexadecimal alphabet', () => {
    const isHexDigit = createDigitValidator(16);

    expect(isHexDigit('g')).toBe(false);
    expect(isHexDigit('G')).toBe(false);
    expect(isHexDigit('-')).toBe(false);
    expect(isHexDigit('')).toBe(false);
  });

  it('is case-insensitive for hexadecimal digits', () => {
    const isHexDigit = createDigitValidator(16);

    expect(isHexDigit('a')).toBe(true);
    expect(isHexDigit('A')).toBe(true);

    expect(isHexDigit('f')).toBe(true);
    expect(isHexDigit('F')).toBe(true);
  });

  it('creates independent validators that do not affect each other', () => {
    const isBinaryDigit = createDigitValidator(2);
    const isHexDigit = createDigitValidator(16);

    expect(isHexDigit('a')).toBe(true);
    expect(isBinaryDigit('a')).toBe(false);

    expect(isBinaryDigit('1')).toBe(true);
    expect(isHexDigit('1')).toBe(true);
  });

  it('throws a RangeError for bases outside the 2-16 range', () => {
    expect(() => createDigitValidator(1)).toThrow(RangeError);
    expect(() => createDigitValidator(0)).toThrow(RangeError);
    expect(() => createDigitValidator(-1)).toThrow(RangeError);

    expect(() => createDigitValidator(17)).toThrow(RangeError);
    expect(() => createDigitValidator(36)).toThrow(RangeError);
  });

  it('throws a RangeError for non-integer bases', () => {
    expect(() => {
      createDigitValidator(2.5);
    }).toThrow(RangeError);

    expect(() => {
      createDigitValidator(10.9);
    }).toThrow(RangeError);

    expect(() => {
      createDigitValidator(Math.PI);
    }).toThrow(RangeError);
  });
});
