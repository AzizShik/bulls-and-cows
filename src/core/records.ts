import type { Settings } from './gameState';

export type GameRecord = {
  settings: Settings;
  attempts: number;
  durationMs: number;
  date: string;
};

export function compareRecords(a: GameRecord, b: GameRecord): number {
  throw new Error(`${a}, ${b} compareRecord is not implemented`);
}

export function addRecord(
  records: readonly GameRecord[],
  record: GameRecord,
  limit = 10,
): GameRecord[] {
  throw new Error(`${records}, ${record}, ${limit} addRecord is not implemented`);
}
