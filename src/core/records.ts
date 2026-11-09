import type { Settings } from './gameState';

export type GameRecord = {
  settings: Settings;
  attempts: number;
  durationMs: number;
  date: string;
};

export function compareRecords(a: GameRecord, b: GameRecord): number {
  if (a.attempts !== b.attempts) return a.attempts - b.attempts;
  if (a.durationMs !== b.durationMs) return a.durationMs - b.durationMs;
  return a.date.localeCompare(b.date);
}

export function addRecord(
  records: readonly GameRecord[],
  record: GameRecord,
  limit = 10,
): GameRecord[] {
  return [...records, record].sort(compareRecords).slice(0, limit);
}
