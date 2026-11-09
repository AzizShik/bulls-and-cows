export type Base = 2 | 8 | 10 | 16;

export type Settings = {
  length: number;
  base: Base;
};

export type Attempt = {
  guess: string;
  bulls: number;
  cows: number;
  at: number;
};

export type GameState = {
  status: 'setup' | 'playing' | 'won';
  settings: Settings | null;
  secret: string | null;
  history: readonly Attempt[];
  startedAt: number | null;
  finishedAt: number | null;
};

export function createInitialState(): GameState {
  throw new Error('createInitialState is not implemented');
}

export function startRound(settings: Settings, secret: string, now: number): GameState {
  throw new Error(`${settings}, ${secret}, ${now} startRound is not implemented`);
}

export function addAttempt(state: GameState, attempt: Attempt): GameState {
  throw new Error(`${state}, ${attempt} addAttempt is not implemented`);
}

export function isWon(state: GameState): boolean {
  throw new Error(`${state} isWon is not implemented`);
}

export function getElapsedMs(state: GameState, now: number): number {
  throw new Error(`${state}, ${now} getElapsedMs is not implemented`);
}
