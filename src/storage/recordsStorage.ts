import type { GameRecord } from '../core/records';

export type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

export const RECORDS_STORAGE_KEY = 'bulls-and-cows:records:v1';

export function loadRecords(storage: StorageLike = localStorage): GameRecord[] {
  try {
    const raw = storage.getItem(RECORDS_STORAGE_KEY);
    if (raw === null) return [];

    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as GameRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveRecords(
  records: readonly GameRecord[],
  storage: StorageLike = localStorage,
): void {
  try {
    storage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
  } catch {
    return;
  }
}
