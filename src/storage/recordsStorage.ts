import type { GameRecord } from '../core/records';

export type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

export const RECORDS_STORAGE_KEY = 'bulls-and-cows:records:v1';

export function loadRecords(storage: StorageLike = localStorage): GameRecord[] {
  throw new Error(`${storage} loadStorage is not implemented`);
}

export function saveRecords(
  records: readonly GameRecord[],
  storage: StorageLike = localStorage,
): void {
  throw new Error(`${records}, ${storage} saveRecords is not implemented`);
}
