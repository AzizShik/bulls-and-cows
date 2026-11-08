import { describe, it, expect } from 'vitest';
import { countPossibleSecrets } from '../../src/core/countPossibleSecrets';

describe('countPossibleSecrets', () => {
  it('should return 1 for zero length', () => {
    expect(countPossibleSecrets(0, 10)).toBe(1);
  });

  it('should count permutations for base 2', () => {
    expect(countPossibleSecrets(1, 2)).toBe(2);
    expect(countPossibleSecrets(2, 2)).toBe(2);
  });

  it('should count permutations for base 8', () => {
    expect(countPossibleSecrets(4, 8)).toBe(1680);
    expect(countPossibleSecrets(6, 8)).toBe(20160);
  });

  it('should count permutations for base 10', () => {
    expect(countPossibleSecrets(4, 10)).toBe(5040);
    expect(countPossibleSecrets(6, 10)).toBe(151200);
  });

  it('should count permutations for base 16', () => {
    expect(countPossibleSecrets(6, 16)).toBe(5765760);
  });

  it('should return 0 when length exceeds base', () => {
    expect(countPossibleSecrets(5, 2)).toBe(0);
    expect(countPossibleSecrets(7, 6)).toBe(0);
  });

  it('should throw RangeError for invalid length', () => {
    expect(() => countPossibleSecrets(-1, 10)).toThrow(RangeError);
    expect(() => countPossibleSecrets(2.5, 10)).toThrow(RangeError);
  });

  it('should throw RangeError for invalid base', () => {
    expect(() => countPossibleSecrets(4, 1)).toThrow(RangeError);
    expect(() => countPossibleSecrets(4, 17)).toThrow(RangeError);
    expect(() => countPossibleSecrets(4, 10.5)).toThrow(RangeError);
  });
});
