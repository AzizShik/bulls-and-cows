import { describe, it, expect } from 'vitest';
import { addRecord } from '../../src/core/records';
import type { GameRecord } from '../../src/core/records';

const makeRecord = (overrides: Partial<GameRecord> = {}): GameRecord => ({
  settings: { length: 4, base: 10 },
  attempts: 3,
  durationMs: 1000,
  date: '2026-11-09T12:00:00.000Z',
  ...overrides,
});

describe('records', () => {
  it('should add a record to an empty list', () => {
    const record = makeRecord();

    const result = addRecord([], record);

    expect(result).toEqual([record]);
  });

  it('should sort records by attempts ascending', () => {
    const fiveAttempts = makeRecord({ attempts: 5 });
    const twoAttempts = makeRecord({ attempts: 2 });

    const result = addRecord([fiveAttempts], twoAttempts);

    expect(result.map((record) => record.attempts)).toEqual([2, 5]);
  });

  it('should sort records by duration when attempts are equal', () => {
    const slow = makeRecord({ attempts: 3, durationMs: 2000 });
    const fast = makeRecord({ attempts: 3, durationMs: 1000 });

    const result = addRecord([slow], fast);

    expect(result.map((record) => record.durationMs)).toEqual([1000, 2000]);
  });

  it('should keep only the best records up to the limit', () => {
    const records = Array.from({ length: 12 }, (_, index) => makeRecord({ attempts: index + 1 }));

    const result = addRecord(records, makeRecord({ attempts: 13 }), 10);

    expect(result).toHaveLength(10);
    expect(result.map((record) => record.attempts)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('should not mutate the input array', () => {
    const records = [makeRecord({ attempts: 5 })];
    const snapshot = [...records];

    addRecord(records, makeRecord({ attempts: 2 }));

    expect(records).toEqual(snapshot);
    expect(records).toHaveLength(1);
  });

  it('should return a new array', () => {
    const records: GameRecord[] = [];

    const result = addRecord(records, makeRecord());

    expect(result).not.toBe(records);
  });
});
