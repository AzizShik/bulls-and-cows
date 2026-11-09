import { createInitialState, startRound } from '../core/gameState';
import type { Base, GameState } from '../core/gameState';
import { generateSecret } from '../core/generateSecret';
import { el } from './dom';
import { BASE_LABELS } from './options';
import { renderSettingsScreen } from './settingsScreen';

type View = 'settings' | 'game';

const DEFAULT_BASE: Base = 10;
const DEFAULT_LENGTH = 4;

let rootEl: HTMLElement;
let state: GameState = createInitialState();
let selectedBase: Base = DEFAULT_BASE;
let selectedLength = DEFAULT_LENGTH;
let view: View = 'settings';

export function mountApp(root: HTMLElement): void {
  rootEl = root;
  render();
}

function render(): void {
  const screen = view === 'settings' ? renderSettings() : renderGamePlaceholder();

  rootEl.replaceChildren(screen);
}

function renderSettings(): HTMLElement {
  return renderSettingsScreen({
    selectedBase,
    selectedLength,
    onSelectBase: handleSelectBase,
    onSelectLength: handleSelectLength,
    onStart: handleStart,
  });
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
  view = 'game';
  render();
}

function renderGamePlaceholder(): HTMLElement {
  const screen = el('section', 'screen game-screen');
  const card = el('div', 'card');

  const header = el('div', 'game-header');
  const settingsBadge = el(
    'span',
    'badge',
    state.settings ? `${state.settings.length} · ${BASE_LABELS[state.settings.base]}` : '',
  );

  header.append(settingsBadge, el('span', 'muted', 'Round started'));

  const title = el('h2', 'title title--small', 'Game screen');
  const subtitle = el('p', 'subtitle', 'Secret generated.');

  const actions = el('div', 'actions');
  const newGameButton = el('button', 'secondary', 'New game');

  newGameButton.type = 'button';
  newGameButton.addEventListener('click', resetToSettings);
  actions.append(newGameButton);

  card.append(header, title, subtitle, actions);
  screen.append(card);

  return screen;
}

function resetToSettings(): void {
  state = createInitialState();
  view = 'settings';
  render();
}
