import type { Base } from '../core/gameState';

export const BASES: readonly Base[] = [2, 8, 10, 16];

export const BASE_LABELS: Record<Base, string> = {
  2: 'BIN',
  8: 'OCT',
  10: 'DEC',
  16: 'HEX',
};

export const MIN_LENGTH = 2;
export const MAX_LENGTH = 6;
