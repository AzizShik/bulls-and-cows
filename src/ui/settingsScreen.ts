import { countPossibleSecrets } from '../core/countPossibleSecrets';
import type { Base } from '../core/gameState';
import { el } from './dom';
import { BASE_LABELS, BASES, MAX_LENGTH, MIN_LENGTH } from './options';

export type SettingsScreenProps = {
  selectedBase: Base;
  selectedLength: number;
  onSelectBase: (base: Base) => void;
  onSelectLength: (length: number) => void;
  onStart: () => void;
  onShowRecords: () => void;
};

export function renderSettingsScreen(props: SettingsScreenProps): HTMLElement {
  const screen = el('section', 'screen settings-screen');
  const card = el('div', 'card');

  const title = el('h1', 'title', 'BULLS & COWS');
  const subtitle = el('p', 'subtitle', 'Guess the secret number made of unique digits');

  const baseField = el('div', 'field');
  const baseLabel = el('span', 'field-label', 'Number base');
  const baseOptions = el('div', 'options');

  baseOptions.setAttribute('role', 'group');
  baseOptions.setAttribute('aria-label', 'Number base');

  for (const base of BASES) {
    const isSelected = base === props.selectedBase;
    const button = el('button', 'option', BASE_LABELS[base]);

    button.type = 'button';
    button.classList.toggle('is-active', isSelected);
    button.setAttribute('aria-pressed', String(isSelected));
    button.addEventListener('click', () => props.onSelectBase(base));

    baseOptions.append(button);
  }

  baseField.append(baseLabel, baseOptions);

  const lengthField = el('div', 'field');
  const lengthLabel = el('span', 'field-label', 'Number length');
  const lengthOptions = el('div', 'options options--compact');

  lengthOptions.setAttribute('role', 'group');
  lengthOptions.setAttribute('aria-label', 'Number length');

  for (let length = MIN_LENGTH; length <= MAX_LENGTH; length += 1) {
    const isSelected = length === props.selectedLength;
    const isDisabled = length > props.selectedBase;
    const button = el('button', 'option', String(length));

    button.type = 'button';
    button.disabled = isDisabled;
    button.classList.toggle('is-active', isSelected);
    button.setAttribute('aria-pressed', String(isSelected));
    button.addEventListener('click', () => props.onSelectLength(length));

    lengthOptions.append(button);
  }

  lengthField.append(lengthLabel, lengthOptions);

  const possibleSecrets = countPossibleSecrets(props.selectedLength, props.selectedBase);
  const summary = el('p', 'summary');
  const summaryLabel = el('span', 'summary-label', 'Possible combinations:');
  const summaryValue = el('strong', 'summary-value', possibleSecrets.toLocaleString('en-US'));

  summary.append(summaryLabel, summaryValue);

  const actions = el('div', 'actions');
  const startButton = el('button', 'primary', 'Start game');
  const recordsButton = el('button', 'secondary', 'Records');

  startButton.type = 'button';
  recordsButton.type = 'button';

  startButton.addEventListener('click', props.onStart);
  recordsButton.addEventListener('click', props.onShowRecords);

  actions.append(startButton, recordsButton);
  card.append(title, subtitle, baseField, lengthField, summary, actions);
  screen.append(card);

  return screen;
}
