# Design Document — Bulls and Cows

## 1. Overview

Bulls and Cows — браузерная игра, в которой компьютер загадывает строку из уникальных цифр, а игрок пытается её угадать. После каждой попытки игрок получает количество `bulls` (цифра на своём месте) и `cows` (цифра есть в секрете, но стоит не на своём месте).

Проект построен по принципу разделения ответственности:

- `src/core` — чистая игровая логика без DOM;
- `src/storage` — тонкий адаптер над `localStorage`;
- `src/ui` — отображение и обработка пользовательских событий.

Стек: TypeScript, Vite, Vitest, ESLint, Prettier, Husky, lint-staged. Бандлер Vite используется для dev-сервера и production-сборки; TypeScript проверяется через `tsc --noEmit`.

Классы для игровой логики не используются: ядро состоит из чистых функций и иммутабельных структур данных.

## 2. Architecture

```
index.html
  └── src/main.ts
        ├── src/styles/main.css
        └── src/ui/app.ts
              ├── src/ui/settingsScreen.ts
              ├── src/ui/gameScreen.ts
              ├── src/ui/recordsScreen.ts
              ├── src/ui/format.ts
              ├── src/ui/dom.ts
              └── src/core/*
                    ├── createDigitValidator.ts
                    ├── generateSecret.ts
                    ├── evaluateGuess.ts
                    ├── isValidGuess.ts
                    ├── countPossibleSecrets.ts
                    ├── gameState.ts
                    └── records.ts
```

`src/core` не импортирует DOM-модули и может тестироваться в среде Node без браузера. В `index.html` в `body` находится только `<script type="module" src="/src/main.ts">`; весь интерфейс создаётся через `document.createElement` и `textContent` без `innerHTML`/`insertAdjacentHTML`.

## 3. Data Structures

### 3.1. Settings

```ts
type Base = 2 | 8 | 10 | 16;

type Settings = {
  length: number;
  base: Base;
};
```

`length` — от 2 до 6, `base` — одна из четырёх игровых систем счисления. Ограничение `length <= base` проверяется в `generateSecret` и UI: для `bin` доступна только длина 2.

### 3.2. GameState

```ts
type GameState = {
  status: 'setup' | 'playing' | 'won';
  settings: Settings | null;
  secret: string | null;
  history: readonly Attempt[];
  startedAt: number | null;
  finishedAt: number | null;
};

type Attempt = {
  guess: string;
  bulls: number;
  cows: number;
  at: number;
};
```

Почему так:

- **`secret` — строка, а не `number`.** Секрет может начинаться с нуля (`0123`); числовой тип потерял бы ведущий ноль и длину.
- **`history` — массив `Attempt`.** Это естественный журнал событий: новые записи добавляются в конец, старые не изменяются и не удаляются.
- **`readonly Attempt[]`.** Тип запрещает мутацию истории на уровне TypeScript.
- **`settings` и `secret` — `null` в статусе `setup`.** Это отражает, что раунд ещё не начался.
- **`startedAt`/`finishedAt` — числа (timestamp).** Время передаётся в чистые функции параметром `now`, поэтому тесты детерминированы.

Обновление состояния выполняется в `src/core/gameState.ts`:

- `createInitialState()` — начальное состояние `setup`;
- `startRound(settings, secret, now)` — создаёт новый объект со статусом `playing`;
- `addAttempt(state, attempt)` — возвращает **новый** `GameState`, не изменяя старый;
- `isWon(state)` — проверяет статус;
- `getElapsedMs(state, now)` — считает длительность и замирает после победы благодаря `finishedAt`.

Ключевая строка иммутабельного обновления:

```ts
const history = [...state.history, attempt];
```

Никаких `push`, `splice` или изменения существующего массива.

### 3.3. Records

```ts
type GameRecord = {
  settings: Settings;
  attempts: number;
  durationMs: number;
  date: string;
};
```

Выбран **один общий список топ-10** с бейджем настроек (`4 · HEX`), а не отдельные таблицы для каждой комбинации `length/base`.

Рекорды хранятся в `localStorage` под версионированным ключом:

```
bulls-and-cows:records:v1
```

`src/storage/recordsStorage.ts` отвечает только за сериализацию и обработку ошибок:

- `loadRecords(storage)` — читает JSON, проверяет `Array.isArray`, при ошибке возвращает `[]`;
- `saveRecords(records, storage)` — пишет JSON, глотает ошибки `localStorage` (приватный режим, переполнение).

Параметр `storage: StorageLike` — dependency injection: в браузере используется `localStorage`, в тестах — фейковое in-memory хранилище на `Map`.

## 4. Algorithms

### 4.1. generateSecret

Файл: `src/core/generateSecret.ts`.

```ts
generateSecret(length: number, base: number, random = Math.random): string
```

Алгоритм — **частичный Fisher–Yates**:

1. Проверить `length` (целое 2–6), `base` (целое 2–16) и `length <= base`.
2. Построить алфавит: `'0123456789abcdef'.slice(0, base)`.
3. Скопировать алфавит в массив `result`.
4. Для `i` от `0` до `length - 1`:
   - выбрать `j = i + floor(random() * (base - i))`;
   - поменять `result[i]` и `result[j]`.
5. Вернуть `result.slice(0, length).join('')`.

Почему так:

- каждая упорядоченная выборка уникальных цифр равновероятна;
- нет повторных попыток и потенциального бесконечного цикла;
- `random` вызывается ровно `length` раз;
- ведущий ноль — обычная цифра, поэтому `0123` не теряется;
- источник случайности передан параметром, поэтому в тестах используется детерминированный `() => 0` или `() => 0.99`.

### 4.2. evaluateGuess

Файл: `src/core/evaluateGuess.ts`.

```ts
evaluateGuess(secret: string, guess: string): { bulls: number; cows: number }
```

Шаги:

1. Привести обе строки к нижнему регистру и развернуть в массивы символов.
2. `bulls` — количество позиций, где символы совпали:
   ```ts
   const bulls = guessChars.filter((char, i) => char === secretChars[i]).length;
   ```
3. Построить `Set` цифр секрета.
4. `common` — сколько цифр попытки вообще присутствуют в секрете:
   ```ts
   const common = guessChars.filter((char) => secretDigits.has(char)).length;
   ```
5. `cows = common - bulls`.

Функция использует `filter` и `Set`, без ручных циклов со счётчиками. Предполагается, что секрет и попытка состоят из уникальных цифр: это гарантируют `generateSecret` и `isValidGuess`. Для невалидных данных с повторами `Set` мог бы завысить `cows`; такие данные до функции не доходят.

### 4.3. isValidGuess

Файл: `src/core/isValidGuess.ts`.

```ts
isValidGuess(guess: string, length: number, base: number): boolean
```

Проверки:

1. `guess.length === length`.
2. `length <= base` — иначе валидной попытки существовать не может.
3. Создать предикат `createDigitValidator(base)`.
4. Привести символы к нижнему регистру.
5. `chars.every(isValidDigit)` — все символы допустимы для базы.
6. `new Set(chars).size === chars.length` — все цифры уникальны.

`createDigitValidator` — каррированная фабрика из `src/core/createDigitValidator.ts`:

```ts
createDigitValidator(base) → (char) => boolean
```

Она используется минимум в двух местах:

- в `isValidGuess` — для проверки всей попытки;
- в `src/ui/gameScreen.ts` — для фильтрации ввода в реальном времени.

Внутри валидатора `char.toLowerCase()` обеспечивает регистронезависимость для hex (`A` и `a` — одна цифра).

### 4.4. countPossibleSecrets

Файл: `src/core/countPossibleSecrets.ts`.

```ts
countPossibleSecrets(length: number, base: number): number
```

Это количество **размещений без повторений**:

```
P(base, length) = base! / (base - length)!
```

Рекуррентная формула:

```
count(0, base) = 1
count(length, base) = base * count(length - 1, base - 1)
count(length, base) = 0, если length > base
```

Публичная функция проверяет входные данные (`length >= 0`, `base` — целое 2–16), а внутренняя `compute` выполняет рекурсию. Разделение нужно потому, что в рекурсии `base` законно уменьшается до 0:

```
compute(2, 2) = 2 * compute(1, 1)
             = 2 * 1 * compute(0, 0)
             = 2
```

Мемоизация реализована через `Map<string, number>` с ключом `${length}:${base}`:

```ts
const cached = cache.get(key);
if (cached !== undefined) return cached;
```

Проверка `cached !== undefined`, а не `if (cached)`, потому что `0` — валидный результат и является falsy-значением.

Кэш живёт на уровне модуля и переживает повторные вызовы. Он особенно полезен на экране настроек: при каждом изменении `length/base` вызывается `countPossibleSecrets`, а одинаковые пары повторно не пересчитываются.

## 5. Complexity

`n` — длина секрета/попытки, `base` — размер алфавита, `h` — длина истории, `r` — количество записей рекордов.

| Function                      | Time                                       | Space       | Обоснование                                                                                                                                                                |
| ----------------------------- | ------------------------------------------ | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `generateSecret`              | `O(base)`                                  | `O(base)`   | Копия алфавита размера `base`, затем до `length` свопов и `slice/join` длины `length`; так как `length <= base`, верхняя граница — `O(base)`. Для base ≤ 16 это константа. |
| `evaluateGuess`               | `O(n)`                                     | `O(n)`      | Приведение к нижнему регистру, `filter` по позициям, построение `Set` и ещё один `filter` — все проходы линейны по `n`.                                                    |
| `isValidGuess`                | `O(n + base)`                              | `O(n)`      | Проверка длины `O(1)`, создание валидатора `O(base)`, `every` и `Set` по `n` символам. `base ≤ 16`, поэтому фактически `O(n)`.                                             |
| `countPossibleSecrets`        | `O(length)` первый вызов, `O(1)` повторный | `O(length)` | Рекурсия уменьшает `length` на 1; каждый уровень — `O(1)` плюс `Map.get/set` в среднем `O(1)`. Повторный вызов с теми же аргументами берётся из кэша.                      |
| `addAttempt`                  | `O(h)`                                     | `O(h)`      | Проверка дубликата через `some` и создание нового массива `[...history, attempt]`.                                                                                         |
| `addRecord`                   | `O(r log r)`                               | `O(r)`      | Копия массива, сортировка компаратором, `slice(0, limit)`. `limit = 10`.                                                                                                   |
| `loadRecords` / `saveRecords` | `O(r)`                                     | `O(r)`      | `JSON.parse`/`JSON.stringify` по количеству записей.                                                                                                                       |
| `getElapsedMs` / `isWon`      | `O(1)`                                     | `O(1)`      | Только чтение полей состояния.                                                                                                                                             |

## 6. Clean Code Principles

### Single Responsibility Principle

Каждый модуль `src/core` отвечает за одну задачу:

- `createDigitValidator.ts` — только создание предиката для base;
- `generateSecret.ts` — только генерация секрета;
- `evaluateGuess.ts` — только подсчёт bulls/cows;
- `isValidGuess.ts` — только проверка попытки;
- `countPossibleSecrets.ts` — только комбинаторика и кэш;
- `gameState.ts` — только переходы состояния;
- `records.ts` — только сортировка/добавление рекордов;
- `recordsStorage.ts` — только работа с хранилищем.

UI-модули также разделены: `settingsScreen.ts`, `gameScreen.ts`, `recordsScreen.ts`, `format.ts`, `dom.ts`.

### DRY

- `createDigitValidator` используется и в `isValidGuess`, и в `gameScreen.ts` для фильтрации ввода.
- `BASE_LABELS`/`BASES` из `src/ui/options.ts` используются в настройках, игровом экране и рекордах.
- `formatDuration` из `src/ui/format.ts` используется и на игровом экране, и на экране рекордов.
- `el` из `src/ui/dom.ts` убирает повторяющееся создание элементов.

### Dependency Injection

- `generateSecret(length, base, random = Math.random)` — источник случайности передаётся параметром, поэтому тесты детерминированы.
- `startRound(settings, secret, now)` и `getElapsedMs(state, now)` — время передаётся параметром, а не читается внутри функции.
- `loadRecords(storage)`/`saveRecords(records, storage)` — хранилище можно подменить в тестах.

### Immutability

- `addAttempt` создаёт новый `GameState` и новый массив `[...state.history, attempt]`.
- `addRecord` создаёт новый массив `[...records, record]`, сортирует копию и обрезает её.
- `history` типизирован как `readonly Attempt[]`.
- Старые записи истории не изменяются и не удаляются.

### Higher-Order Functions

- `evaluateGuess`: `filter` для bulls и common.
- `isValidGuess`: `every` для проверки символов.
- `addAttempt`: `some` для поиска дубликата.
- `records.ts`: `sort` с компаратором `compareRecords`.

### Currying

`createDigitValidator(base)` возвращает функцию `(char) => boolean`. База фиксируется один раз, а предикат затем используется многократно и в валидации, и в UI.

### Memoization

`countPossibleSecrets` кэширует результаты в `Map` по ключу `${length}:${base}`. Это чистая мемоизация: результат зависит только от аргументов, поэтому кэш не может «устареть».

### KISS и Fail Fast

- Для генерации выбран частичный Fisher–Yates, а не «выбирай случайную цифру и повторяй при дубликате»: нет риска зацикливания.
- Некорректные `length`/`base` в `generateSecret` и `createDigitValidator` сразу приводят к `RangeError`.
- `countPossibleSecrets` возвращает `0` для `length > base`, потому что это валидный вопрос с ответом «ноль», а не ошибка программы.
- Ошибки `localStorage` не пробрасываются в UI: рекорды не должны ронять игру.

### Separation of Concerns

- `src/core` не знает о DOM.
- `src/storage` не содержит правил игры.
- `src/ui` не вычисляет bulls/cows вручную, а вызывает `evaluateGuess`.
- В `index.html` `body` пустой, кроме `<script>`; динамический контент создаётся через `document.createElement` и `textContent`.

## 7. Testing Strategy

Тесты расположены в `tests/core` и `tests/storage`. Для каждой обязательной функции сначала писался красный тест, затем реализация:

- `tests/core/createDigitValidator.test.ts`
- `tests/core/generateSecret.test.ts`
- `tests/core/evaluateGuess.test.ts`
- `tests/core/isValidGuess.test.ts`
- `tests/core/countPossibleSecrets.test.ts`
- `tests/core/gameState.test.ts`
- `tests/core/records.test.ts`
- `tests/storage/recordsStorage.test.ts`

Соблюдаются принципы FIRST:

- **Fast** — все тесты выполняются за доли секунды;
- **Independent** — каждый тест создаёт свои данные;
- **Repeatable** — нет реального `Math.random` и `Date.now` в логике;
- **Self-validating** — только `expect`, без ручной проверки;
- **Timely** — тесты написаны до реализации.

Для детерминированности:

- `generateSecret` получает `random` как параметр;
- `gameState` получает `now` как параметр;
- `recordsStorage` получает `StorageLike` как параметр.

## 8. UI and Accessibility

- Терминальная тёмная тема, `Space Grotesk` для текста и `JetBrains Mono` для цифр.
- Все интерактивные элементы — нативные `button`/`input`.
- Для групп выбора base и length используется `role="group"` и `aria-label`.
- Активные кнопки помечаются `aria-pressed`.
- Сообщения об ошибках и результат попытки объявляются через `aria-live="polite"`.
- Есть видимый `:focus-visible`.
- Ввод фильтруется через `createDigitValidator`, hex приводится к нижнему регистру.
- Настройки после старта раунда недоступны: игровой экран не содержит контролов настроек.
- «New game» сбрасывает состояние в `setup` без перезагрузки страницы.

## 9. Trade-offs

- `evaluateGuess` использует `Set` и предполагает уникальные цифры. Это соответствует правилам игры и упрощает алгоритм; при необходимости поддержки дублей понадобились бы счётчики мультимножеств.
- Выбран один общий список рекордов с бейджем настроек вместо отдельного списка на каждую комбинацию `length/base`. Это проще в реализации и соответствует разрешённому варианту задания.
- `localStorage` может быть недоступен; в этом случае рекорды не сохраняются, но игра продолжает работать.
- `countPossibleSecrets` мемоизирован на уровне модуля. Кэш не очищается, потому что область значений мала (`base` 4 варианта, `length` 2–6), а результаты детерминированы.
