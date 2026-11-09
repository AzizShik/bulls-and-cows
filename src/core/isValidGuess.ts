import { createDigitValidator } from './createDigitValidator';

export function isValidGuess(guess: string, length: number, base: number): boolean {
  if (guess.length !== length) return false;
  if (length > base) return false;

  const isValidDigit = createDigitValidator(base);
  const chars = [...guess.toLowerCase()];
  const isAllDigitsValid = chars.every(isValidDigit);
  const isAllDigitsUnique = new Set(chars).size === chars.length;

  return isAllDigitsValid && isAllDigitsUnique;
}
