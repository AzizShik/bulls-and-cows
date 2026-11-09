import { createDigitValidator } from '../core/createDigitValidator';
import type { GameState } from '../core/gameState';
import { el } from './dom';
import { formatDuration } from './format';
import { BASE_LABELS } from './options';

export type GameScreenProps = {
  state: GameState;
  message: string;
  elapsedMs: number;
  onSubmit: (guess: string) => void;
  onNewGame: () => void;
};

export function renderGameScreen(props: GameScreenProps): HTMLElement {
  const settings = props.state.settings;

  if (settings === null) {
    return el('section', 'screen game-screen', 'Game is not started.');
  }

  const { base, length } = settings;
  const isFinished = props.state.status === 'won';
  const screen = el('section', 'screen game-screen');
  const card = el('div', 'card');

  const header = el('div', 'game-header');
  const badge = el('span', 'badge', `${length} · ${BASE_LABELS[base]}`);
  const timer = el('span', 'badge badge--timer');

  timer.dataset.timer = '';
  timer.textContent = formatDuration(props.elapsedMs);
  timer.setAttribute('aria-label', 'Elapsed time');

  const attemptLabel = el(
    'span',
    'muted',
    isFinished
      ? `Solved in ${props.state.history.length} attempts`
      : `Attempt ${props.state.history.length + 1}`,
  );

  header.append(badge, attemptLabel, timer);

  const title = el('h2', 'title title--small', isFinished ? 'Solved!' : 'Make a guess');
  const subtitle = el(
    'p',
    'subtitle',
    'Bulls are correct digits in the correct position. Cows are correct digits in the wrong position.',
  );

  card.append(header, title, subtitle);

  if (isFinished) {
    const result = el('div', 'result');
    const resultLine = el(
      'p',
      'result-line',
      `${props.state.history.length} attempts · ${formatDuration(props.elapsedMs)}`,
    );

    result.append(resultLine);
    card.append(result);

    const actions = el('div', 'actions');
    const newGame = el('button', 'primary', 'New game');

    newGame.type = 'button';
    newGame.addEventListener('click', props.onNewGame);
    actions.append(newGame);

    card.append(actions);
  } else {
    const form = el('form', 'guess-form');
    const input = document.createElement('input');
    const submit = el('button', 'primary', 'Check');
    const hint = el(
      'p',
      'hint',
      `Use ${length} unique digits from the ${BASE_LABELS[base]} alphabet.`,
    );
    const message = el('p', 'message', props.message);

    input.type = 'text';
    input.className = 'guess-input';
    input.maxLength = length;
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.inputMode = base === 16 ? 'text' : 'numeric';
    input.setAttribute('aria-label', 'Your guess');

    const isValidDigit = createDigitValidator(base);

    input.addEventListener('input', () => {
      input.value = [...input.value.toLowerCase()].filter(isValidDigit).slice(0, length).join('');
    });

    submit.type = 'submit';
    form.append(input, submit);

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      props.onSubmit(input.value);
    });

    message.setAttribute('aria-live', 'polite');

    card.append(form, hint, message);
  }

  const historySection = el('div', 'history');
  const historyTitle = el('h3', 'history-title', 'Attempts');

  historySection.append(historyTitle);

  if (props.state.history.length === 0) {
    historySection.append(el('p', 'empty', 'No attempts yet.'));
  } else {
    const list = el('ol', 'history-list');

    [...props.state.history].reverse().forEach((attempt, index) => {
      const number = props.state.history.length - index;
      const item = el('li', 'history-item');
      const bulls = el('span', 'bulls', `● ${attempt.bulls}`);
      const cows = el('span', 'cows', `○ ${attempt.cows}`);

      bulls.setAttribute('aria-label', `${attempt.bulls} bulls`);
      cows.setAttribute('aria-label', `${attempt.cows} cows`);

      item.append(
        el('span', 'attempt-number', `#${number}`),
        el('span', 'attempt-guess', attempt.guess),
        bulls,
        cows,
      );
      list.append(item);
    });

    historySection.append(list);
  }

  card.append(historySection);
  screen.append(card);

  return screen;
}
