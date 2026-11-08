import { describe, it, expect } from 'vitest';
import { isValidGuess } from '../../src/core/isValidGuess';

describe('isValidGuess', () => {
  it('should accept a guess of the required length', () => {
    expect(isValidGuess('1234', 4, 10)).toBe(true);
  });

  it('should reject a guess with the wrong length', () => {
    expect(isValidGuess('123', 4, 10)).toBe(false);
    expect(isValidGuess('12345', 4, 10)).toBe(false);
  });

  it('should reject characters that are not allowed in the base', () => {
    expect(isValidGuess('12', 2, 2)).toBe(false);
    expect(isValidGuess('12ab', 4, 10)).toBe(false);
  });

  it('should reject repeated digits', () => {
    expect(isValidGuess('1123', 4, 10)).toBe(false);
    expect(isValidGuess('aabb', 4, 16)).toBe(false);
  });

  it('should accept hexadecimal digits in either case', () => {
    expect(isValidGuess('ABCD', 4, 16)).toBe(true);
  });

  it('should accept leading zeros', () => {
    expect(isValidGuess('01', 2, 2)).toBe(true);
    expect(isValidGuess('0123', 4, 10)).toBe(true);
  });

  it('should reject empty strings and whitespace', () => {
    expect(isValidGuess('', 2, 2)).toBe(false);
    expect(isValidGuess('12 4', 4, 10)).toBe(false);
  });

  it('should reject a guess when length exceeds the base', () => {
    expect(isValidGuess('1234', 4, 2)).toBe(false);
  });

  it('should treat hex digits case-insensitively when checking uniqueness', () => {
    expect(isValidGuess('A1a2', 4, 16)).toBe(false);
  });

  it('should accept a valid octal guess', () => {
    expect(isValidGuess('0123', 4, 8)).toBe(true);
  });
});
