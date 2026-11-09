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
  return {
    status: 'setup',
    settings: null,
    secret: null,
    history: [],
    startedAt: null,
    finishedAt: null,
  };
}

export function startRound(settings: Settings, secret: string, now: number): GameState {
  return {
    status: 'playing',
    settings: settings,
    secret: secret,
    history: [],
    startedAt: now,
    finishedAt: null,
  };
}

export function addAttempt(state: GameState, attempt: Attempt): GameState {
  if (state.status !== 'playing') return state;

  const isDuplicateGuess = state.history.some((obj) => obj.guess === attempt.guess);
  if (isDuplicateGuess) return state;

  const history = [...state.history, attempt];
  const isWin = attempt.bulls === state.settings?.length;

  return {
    ...state,
    status: isWin ? 'won' : 'playing',
    history,
    finishedAt: isWin ? attempt.at : null,
  };
}

export function isWon(state: GameState): boolean {
  return state.status === 'won';
}

export function getElapsedMs(state: GameState, now: number): number {
  if (state.startedAt === null) return 0;

  const end = state.finishedAt ?? now;
  return end - state.startedAt;
}
