import { describe, it, expect } from 'vitest';
import { loadRecords, RECORDS_STORAGE_KEY, saveRecords } from '../../src/storage/recordsStorage';

import type { StorageLike } from '../../src/storage/recordsStorage';
import type { GameRecord } from '../../src/core/records';

const createMemoryStorage = (): StorageLike => {
  const data = new Map<string, string>();

  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
};

const makeRecord = (): GameRecord => ({
  settings: { length: 4, base: 10 },
  attempts: 3,
  durationMs: 1000,
  date: '2026-11-09T12:00:00.000Z',
});

describe('recordsStorage', () => {
  it('should return an empty list when storage is empty', () => {
    const storage = createMemoryStorage();

    expect(loadRecords(storage)).toEqual([]);
  });

  it('should return an empty list for malformed JSON', () => {
    const storage = createMemoryStorage();
    storage.setItem(RECORDS_STORAGE_KEY, '{oops');

    expect(loadRecords(storage)).toEqual([]);
  });

  it('should return an empty list when stored value is not an array', () => {
    const storage = createMemoryStorage();
    storage.setItem(RECORDS_STORAGE_KEY, JSON.stringify({ foo: 'bar' }));

    expect(loadRecords(storage)).toEqual([]);
  });

  it('should save records as JSON under the storage key', () => {
    const storage = createMemoryStorage();
    const record = makeRecord();

    saveRecords([record], storage);

    expect(JSON.parse(storage.getItem(RECORDS_STORAGE_KEY)!)).toEqual([record]);
  });

  it('should load what was saved', () => {
    const storage = createMemoryStorage();
    const record = makeRecord();

    saveRecords([record], storage);

    expect(loadRecords(storage)).toEqual([record]);
  });

  it('should not throw when saving fails', () => {
    const storage: StorageLike = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    };

    expect(() => saveRecords([makeRecord()], storage)).not.toThrow();
  });

  it('should return an empty list when reading fails', () => {
    const storage: StorageLike = {
      getItem: () => {
        throw new Error('SecurityError');
      },
      setItem: () => {},
    };

    expect(loadRecords(storage)).toEqual([]);
  });
});
