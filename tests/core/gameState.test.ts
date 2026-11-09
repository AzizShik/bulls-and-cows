import { describe, it, expect } from 'vitest';
import {
  addAttempt,
  createInitialState,
  getElapsedMs,
  isWon,
  startRound,
} from '../../src/core/gameState';

describe('gameState', () => {
  it('should create the initial setup state', () => {
    const gameState = createInitialState();

    expect(gameState.status).toBe('setup');
    expect(gameState.history).toEqual([]);
    expect(gameState.settings).toBe(null);
    expect(gameState.secret).toBe(null);
    expect(gameState.startedAt).toBe(null);
    expect(gameState.finishedAt).toBe(null);
  });

  it('should start a round with the given settings and secret', () => {
    const settings = { length: 4, base: 10 } as const;
    const now = 1000;

    const state = startRound(settings, '1243', now);

    expect(state.status).toBe('playing');
    expect(state.settings).toEqual(settings);
    expect(state.secret).toBe('1243');
    expect(state.startedAt).toBe(now);
    expect(state.finishedAt).toBeNull();
    expect(state.history).toEqual([]);
  });

  it('should append a first attempt', () => {
    const state = startRound({ length: 4, base: 10 }, '1243', 1000);
    const attempt = { guess: '1234', bulls: 2, cows: 2, at: 1500 };

    const next = addAttempt(state, attempt);

    expect(next.history).toEqual([attempt]);
    expect(next).not.toBe(state);
    expect(state.history).toEqual([]);
  });

  it('should ignore an attempt that is already in history', () => {
    const state = startRound({ length: 4, base: 10 }, '1243', 1000);
    const attempt = { guess: '1234', bulls: 2, cows: 2, at: 1500 };

    const afterFirst = addAttempt(state, attempt);
    const afterSecond = addAttempt(afterFirst, { ...attempt, at: 1900 });

    expect(afterSecond.history).toHaveLength(1);
    expect(afterSecond.history[0]).toEqual(attempt);
  });

  it('should mark the game as won when all digits are bulls', () => {
    const state = startRound({ length: 4, base: 10 }, '1243', 1000);

    const won = addAttempt(state, {
      guess: '1243',
      bulls: 4,
      cows: 0,
      at: 1800,
    });

    expect(won.status).toBe('won');
    expect(won.finishedAt).toBe(1800);
    expect(isWon(won)).toBe(true);
  });

  it('should not add attempts after the game is won', () => {
    const state = startRound({ length: 4, base: 10 }, '1243', 1000);
    const won = addAttempt(state, { guess: '1243', bulls: 4, cows: 0, at: 1800 });

    const next = addAttempt(won, { guess: '5678', bulls: 0, cows: 0, at: 1900 });

    expect(next.history).toHaveLength(1);
    expect(next.status).toBe('won');
  });

  it('should return zero elapsed time before the round starts', () => {
    expect(getElapsedMs(createInitialState(), 1000)).toBe(0);
  });

  it('should calculate elapsed time during the round', () => {
    const state = startRound({ length: 4, base: 10 }, '1243', 1000);

    expect(getElapsedMs(state, 2500)).toBe(1500);
  });

  it('should report a game as not won while playing', () => {
    const state = startRound({ length: 4, base: 10 }, '1243', 1000);

    expect(isWon(state)).toBe(false);
  });

  it('should freeze elapsed time after the game is won', () => {
    const state = startRound({ length: 4, base: 10 }, '1243', 1000);
    const won = addAttempt(state, {
      guess: '1243',
      bulls: 4,
      cows: 0,
      at: 1800,
    });

    expect(getElapsedMs(won, 5000)).toBe(800);
  });

  it('should not mutate the previous state', () => {
    const state = startRound({ length: 4, base: 10 }, '1234', 1000);

    const attempt = {
      guess: '5678',
      bulls: 0,
      cows: 0,
      at: 2000,
    };

    const next = addAttempt(state, attempt);

    expect(state.history).toHaveLength(0);
    expect(next.history).toHaveLength(1);
    expect(next).not.toBe(state);
    expect(next.history[0]).toEqual(attempt);
  });
});
