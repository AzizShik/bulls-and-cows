export function createDigitValidator(base: number): (char: string) => boolean {
  if (!Number.isInteger(base) || base < 2 || base > 16) {
    throw new RangeError('Base must be an integer between 2 and 16');
  }

  const alphabet = '0123456789abcdef'.slice(0, base);

  return (char: string) => {
    const normalized = char.toLowerCase();

    return normalized.length === 1 && alphabet.includes(normalized);
  };
}
