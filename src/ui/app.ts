import { addAttempt, createInitialState, getElapsedMs, isWon, startRound } from '../core/gameState';
import type { Base, GameState } from '../core/gameState';
import { evaluateGuess } from '../core/evaluateGuess';
import { generateSecret } from '../core/generateSecret';
import { isValidGuess } from '../core/isValidGuess';
import { addRecord } from '../core/records';
import type { GameRecord } from '../core/records';
import { loadRecords, saveRecords } from '../storage/recordsStorage';
import { formatDuration } from './format';
import { renderGameScreen } from './gameScreen';
import { BASE_LABELS } from './options';
import { renderRecordsScreen } from './recordsScreen';
import { renderSettingsScreen } from './settingsScreen';

type View = 'settings' | 'game' | 'records';
type ReturnView = 'settings' | 'game';

const DEFAULT_BASE: Base = 10;
const DEFAULT_LENGTH = 4;

let rootEl: HTMLElement;
let state: GameState = createInitialState();
let records: GameRecord[] = loadRecords();
let selectedBase: Base = DEFAULT_BASE;
let selectedLength = DEFAULT_LENGTH;
let view: View = 'settings';
let recordsReturnView: ReturnView = 'settings';
let message = '';
let timerId: number | null = null;

export function mountApp(root: HTMLElement): void {
  rootEl = root;
  render();
}

function render(): void {
  if (view === 'settings') {
    rootEl.replaceChildren(
      renderSettingsScreen({
        selectedBase,
        selectedLength,
        onSelectBase: handleSelectBase,
        onSelectLength: handleSelectLength,
        onStart: handleStart,
        onShowRecords: handleShowRecords,
      }),
    );

    return;
  }

  if (view === 'records') {
    rootEl.replaceChildren(
      renderRecordsScreen({
        records,
        onBack: handleBackFromRecords,
        onNewGame: resetToSettings,
      }),
    );

    return;
  }

  rootEl.replaceChildren(
    renderGameScreen({
      state,
      message,
      elapsedMs: getElapsedMs(state, Date.now()),
      onSubmit: handleGuess,
      onNewGame: resetToSettings,
      onShowRecords: handleShowRecords,
    }),
  );

  if (state.status === 'playing') {
    rootEl.querySelector<HTMLInputElement>('.guess-input')?.focus();
  }
}

function handleSelectBase(base: Base): void {
  selectedBase = base;

  if (selectedLength > base) {
    selectedLength = 2;
  }

  render();
}

function handleSelectLength(length: number): void {
  selectedLength = length;
  render();
}

function handleStart(): void {
  const settings = { length: selectedLength, base: selectedBase };
  const secret = generateSecret(settings.length, settings.base);

  state = startRound(settings, secret, Date.now());
  message = '';
  view = 'game';
  startTimer();
  render();
}

function handleGuess(rawGuess: string): void {
  if (state.status !== 'playing' || state.settings === null || state.secret === null) {
    return;
  }

  const { length, base } = state.settings;
  const guess = rawGuess.trim().toLowerCase();

  if (!isValidGuess(guess, length, base)) {
    message = `Enter ${length} unique digits valid for ${BASE_LABELS[base]} base.`;
    render();
    return;
  }

  if (state.history.some((attempt) => attempt.guess === guess)) {
    message = 'This guess was already tried.';
    render();
    return;
  }

  const { bulls, cows } = evaluateGuess(state.secret, guess);

  state = addAttempt(state, {
    guess,
    bulls,
    cows,
    at: Date.now(),
  });

  message = '';

  if (isWon(state)) {
    stopTimer();
    saveResult();
  }

  render();
}

function saveResult(): void {
  if (state.settings === null) {
    return;
  }

  records = addRecord(records, {
    settings: state.settings,
    attempts: state.history.length,
    durationMs: getElapsedMs(state, Date.now()),
    date: new Date().toISOString(),
  });

  saveRecords(records);
}

function handleShowRecords(): void {
  if (view !== 'records') {
    recordsReturnView = view;
  }

  records = loadRecords();
  view = 'records';
  render();
}

function handleBackFromRecords(): void {
  view = recordsReturnView;
  render();
}

function startTimer(): void {
  stopTimer();

  timerId = window.setInterval(() => {
    const timer = rootEl.querySelector<HTMLElement>('[data-timer]');

    if (timer) {
      timer.textContent = formatDuration(getElapsedMs(state, Date.now()));
    }
  }, 250);
}

function stopTimer(): void {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
}

function resetToSettings(): void {
  stopTimer();
  state = createInitialState();
  message = '';
  recordsReturnView = 'settings';
  view = 'settings';
  render();
}
