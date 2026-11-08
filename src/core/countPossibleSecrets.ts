const cache = new Map<string, number>();

function compute(length: number, base: number): number {
  if (length === 0) return 1;
  if (length > base) return 0;

  const key = `${length}:${base}`;
  const cached = cache.get(key);

  if (cached !== undefined) return cached;

  const value = base * compute(length - 1, base - 1);

  cache.set(key, value);

  return value;
}

export function countPossibleSecrets(length: number, base: number): number {
  if (!Number.isInteger(length) || length < 0)
    throw new RangeError('Length must be a non-negative integer');
  if (!Number.isInteger(base) || base < 2 || base > 16)
    throw new RangeError('Base must be an integer in 2-16 range');

  return compute(length, base);
}
