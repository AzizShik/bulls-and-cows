import { describe, it, expect } from 'vitest';
import { evaluateGuess } from '../../src/core/evaluateGuess';

describe('evaluateGuess', () => {
  it('should match perfectly', () => {
    const secret = '1234';
    const guess = '1234';

    const result = { bulls: 4, cows: 0 };

    expect(evaluateGuess(secret, guess)).toEqual(result);
  });

  it('should mismatch completely', () => {
    const secret = '1234';
    const guess = '5678';

    const result = { bulls: 0, cows: 0 };

    expect(evaluateGuess(secret, guess)).toEqual(result);
  });

  it('should count all digits as cows when every digit is misplaced', () => {
    const secret = '1234';
    const guess = '4321';

    const result = { bulls: 0, cows: 4 };

    expect(evaluateGuess(secret, guess)).toEqual(result);
  });

  it('should count bulls and cows for a partially correct guess', () => {
    const secret = '1234';
    const guess = '1243';

    const result = { bulls: 2, cows: 2 };

    expect(evaluateGuess(secret, guess)).toEqual(result);
  });

  it('should preserve a leading zero', () => {
    const secret = '0123';
    const guess = '0123';

    const result = { bulls: 4, cows: 0 };

    expect(evaluateGuess(secret, guess)).toEqual(result);
  });

  it('should compare hexadecimal digits case-insensitively', () => {
    const secret = 'a1b2';
    const guess = 'A1B2';

    const result = { bulls: 4, cows: 0 };

    expect(evaluateGuess(secret, guess)).toEqual(result);
    expect(evaluateGuess('a1b2', 'B2A1')).toEqual({ bulls: 0, cows: 4 });
  });

  it('should return zero counts for empty strings', () => {
    const secret = '';
    const guess = '';

    const result = { bulls: 0, cows: 0 };

    expect(evaluateGuess(secret, guess)).toEqual(result);
  });
});
