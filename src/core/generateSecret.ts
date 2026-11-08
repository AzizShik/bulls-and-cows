export function generateSecret(length: number, base: number, random = Math.random): string {
  if (!Number.isInteger(length) || length < 2 || length > 6) {
    throw new RangeError('Length must be an integer between 2 and 6');
  }

  if (!Number.isInteger(base) || base < 2 || base > 16) {
    throw new RangeError('Base must be an integer between 2 and 16');
  }

  if (length > base) {
    throw new RangeError('Length must not exceed base');
  }

  const alphabet = '0123456789abcdef'.slice(0, base);
  const result = [...alphabet];

  for (let i = 0; i < length; i++) {
    const j = i + Math.floor(random() * (alphabet.length - i));

    [result[i], result[j]] = [result[j], result[i]];
  }

  return result.slice(0, length).join('');
}
