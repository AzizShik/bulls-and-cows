import { describe, it, expect } from 'vitest';
import { generateSecret } from '../../src/core/generateSecret';
import { createDigitValidator } from '../../src/core/createDigitValidator';

describe('generateSecret', () => {
  const fakeRandom = () => 0;

  it('should preserve a leading zero and return a string of expected length', () => {
    const base = 10;
    const length = 4;
    const secret = generateSecret(length, base, fakeRandom);

    expect(secret).toBe('0123');
    expect(secret.length).toBe(4);
  });

  it('should return a string with the exact requested length', () => {
    const secretLength2 = generateSecret(2, 10, fakeRandom);
    expect(secretLength2.length).toBe(2);

    const secretLength4 = generateSecret(4, 10, fakeRandom);
    expect(secretLength4.length).toBe(4);

    const secretLength6 = generateSecret(6, 16, fakeRandom);
    expect(secretLength6.length).toBe(6);
  });

  it('should return only binary digits for base 2', () => {
    const secret = generateSecret(2, 2, fakeRandom);

    expect([...secret].sort().join('')).toBe('01');
  });

  it('should return only octal digits for base 8', () => {
    const secret = generateSecret(4, 8, fakeRandom);
    const isValidOctalDigit = createDigitValidator(8);

    expect([...secret].every(isValidOctalDigit)).toBe(true);
  });

  it('should return only decimal digits for base 10', () => {
    const secret = generateSecret(4, 10, fakeRandom);
    const isValidDecimalDigit = createDigitValidator(10);

    expect([...secret].every(isValidDecimalDigit)).toBe(true);
  });

  it('should return only hexadecimal digits for base 16', () => {
    const secret = generateSecret(4, 16, fakeRandom);
    const isValidHexadecimalDigit = createDigitValidator(16);

    expect([...secret].every(isValidHexadecimalDigit)).toBe(true);
  });

  it('should return a string consisting of unique digits only', () => {
    const secret = generateSecret(4, 10, fakeRandom);
    expect(new Set(secret).size).toBe(secret.length);
  });

  it('should produce the same secret for the same random source', () => {
    const random = () => 0.4;

    expect(generateSecret(4, 10, random)).toBe(generateSecret(4, 10, random));
  });

  it('should use Math.random when no random source is provided', () => {
    const secret = generateSecret(4, 10);

    expect(secret.length).toBe(4);
    expect(new Set(secret).size).toBe(4);
    expect([...secret].every(createDigitValidator(10))).toBe(true);
  });

  it('throws a RangeError if length is outside the 2-6 range', () => {
    expect(() => generateSecret(1, 10)).toThrow(RangeError);
    expect(() => generateSecret(7, 10)).toThrow(RangeError);
  });

  it('throws a RangeError for bases outside the 2-16 range', () => {
    expect(() => generateSecret(4, 1)).toThrow(RangeError);
    expect(() => generateSecret(4, 17)).toThrow(RangeError);
    expect(() => generateSecret(4, 36)).toThrow(RangeError);
  });

  it('throws a RangeError if requested length exceeds available digits in base', () => {
    expect(() => generateSecret(3, 2)).toThrow(RangeError);
  });

  it('throws a RangeError for non-integer length', () => {
    expect(() => generateSecret(2.5, 10)).toThrow(RangeError);
  });

  it('throws a RangeError for non-integer bases', () => {
    expect(() => {
      generateSecret(4, 2.5);
    }).toThrow(RangeError);

    expect(() => {
      generateSecret(4, 10.9);
    }).toThrow(RangeError);

    expect(() => {
      generateSecret(4, Math.PI);
    }).toThrow(RangeError);
  });
});
