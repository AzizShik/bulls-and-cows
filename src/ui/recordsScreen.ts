import { compareRecords } from '../core/records';
import type { GameRecord } from '../core/records';
import { el } from './dom';
import { formatDuration } from './format';
import { BASE_LABELS } from './options';

export type RecordsScreenProps = {
  records: readonly GameRecord[];
  onBack: () => void;
  onNewGame: () => void;
};

export function renderRecordsScreen(props: RecordsScreenProps): HTMLElement {
  const screen = el('section', 'screen records-screen');
  const card = el('div', 'card');
  const title = el('h1', 'title', 'Records');
  const subtitle = el('p', 'subtitle', 'Top 10 results across all settings.');

  const records = [...props.records].sort(compareRecords).slice(0, 10);

  const list = el('ol', 'records-list');

  if (records.length === 0) {
    list.append(el('li', 'empty', 'No records yet. Play a round to set your first result.'));
  } else {
    records.forEach((record, index) => {
      const item = el('li', 'record-item');
      const rank = el('span', 'record-rank', `#${index + 1}`);
      const attempts = el('span', 'record-attempts', `${record.attempts} attempts`);
      const time = el('span', 'record-time', formatDuration(record.durationMs));
      const settings = el(
        'span',
        'badge',
        `${record.settings.length} · ${BASE_LABELS[record.settings.base]}`,
      );

      item.append(rank, attempts, time, settings);
      list.append(item);
    });
  }

  const actions = el('div', 'actions');
  const backButton = el('button', 'secondary', 'Back');
  const newGameButton = el('button', 'primary', 'New game');

  backButton.type = 'button';
  newGameButton.type = 'button';
  backButton.addEventListener('click', props.onBack);
  newGameButton.addEventListener('click', props.onNewGame);

  actions.append(backButton, newGameButton);

  card.append(title, subtitle, list, actions);
  screen.append(card);

  return screen;
}
