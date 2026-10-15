import { readFileSync } from 'node:fs';
import { assertDimensions, assertMinefield, assertState, assertRevealAction,
  makeGrid, cloneState, copyGrid, parseCoordinate } from './model.js';

/** Fixed layouts default to unprotected; generated games opt into protection. */
export function createState(mines, firstRevealPending = false) {
  assertMinefield(mines);
  const state = { mines: copyGrid(mines), revealed: makeGrid(mines.length, mines[0].length),
    flagged: makeGrid(mines.length, mines[0].length), status: 'playing', exploded: null,
    firstRevealPending };
  assertState(state); return state;
}
/** Reproducible PRNG, not intended for cryptographic use. */
export function seededRandom(seed) {
  let value = 2166136261;
  for (const char of String(seed)) value = Math.imul(value ^ char.charCodeAt(0), 16777619) >>> 0;
  return () => {
    value = (value + 0x6D2B79F5) >>> 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function generateMinefield(rows, columns, mineCount, seed = 'practice') {
  assertDimensions(rows, columns);
  if (!Number.isInteger(mineCount)) throw new TypeError('Mine count must be an integer.');
  if (mineCount < 0 || mineCount >= rows * columns) throw new RangeError('Mine count must leave at least one safe cell.');
  const random = seededRandom(seed);
  const positions = Array.from({ length: rows * columns }, (_, i) => i);
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  const mines = makeGrid(rows, columns);
  for (const i of positions.slice(0, mineCount)) mines[Math.floor(i / columns)][i % columns] = true;
  return mines;
}
export function createGame(rows = 9, columns = 9, mineCount = 10, seed = 'practice') {
  return createState(generateMinefield(rows, columns, mineCount, seed), true);
}
/**
 * Supplied first-reveal protection. Returns an isolated copy after validating the
 * action. If needed, moves the selected mine to the first safe cell in row-major
 * order. This preserves mine count and existing flags, not uniform randomness.
 * It does NOT reveal cells or determine win/loss; those are your exercise.
 */
export function prepareReveal(state, row, column) {
  assertRevealAction(state, row, column);
  const next = cloneState(state);
  if (next.firstRevealPending && next.mines[row][column]) {
    outer: for (let r = 0; r < next.mines.length; r++) {
      for (let c = 0; c < next.mines[0].length; c++) {
        if (!next.mines[r][c]) {
          next.mines[r][c] = true; next.mines[row][column] = false;
          break outer;
        }
      }
    }
  }
  next.firstRevealPending = false;
  return next;
}
/** Counts for the status panel; does not decide whether a player has won. */
export function getProgress(state) {
  assertState(state);
  let mines = 0, flags = 0, revealedSafe = 0;
  for (let r = 0; r < state.mines.length; r++) for (let c = 0; c < state.mines[0].length; c++) {
    if (state.mines[r][c]) mines++;
    if (state.flagged[r][c]) flags++;
    if (state.revealed[r][c] && !state.mines[r][c]) revealedSafe++;
  }
  return { mines, flags, revealedSafe, totalSafe: state.mines.length * state.mines[0].length - mines };
}
/** Human-readable scenario schema; fixed boards have no first-click relocation. */
export function stateFromScenario(data) {
  if (!data || !Array.isArray(data.layout) || !data.layout.length ||
      !data.layout.every(row => typeof row === 'string' && /^[.*]+$/.test(row))) {
    throw new TypeError('Scenario layout must be an array of strings using . and *.');
  }
  const state = createState(data.layout.map(row => [...row].map(cell => cell === '*')),
    data.firstRevealPending ?? false);
  if (state.mines[0].length > 26) throw new RangeError('CLI scenarios support at most 26 columns.');
  for (const [field, source] of [['revealed', 'revealed'], ['flagged', 'flags']]) {
    const coordinates = data[source] ?? [];
    if (!Array.isArray(coordinates)) throw new TypeError(`${source} must be an array.`);
    const seen = new Set();
    for (const coordinate of coordinates) {
      const [r, c] = parseCoordinate(coordinate, state.mines.length, state.mines[0].length);
      const key = `${r},${c}`;
      if (seen.has(key)) throw new TypeError(`Duplicate ${source} coordinate.`);
      seen.add(key); state[field][r][c] = true;
    }
  }
  state.status = data.status ?? 'playing';
  state.exploded = data.exploded == null ? null : parseCoordinate(data.exploded, state.mines.length, state.mines[0].length);
  assertState(state); return state;
}
export function loadScenario(path) { return stateFromScenario(JSON.parse(readFileSync(path, 'utf8'))); }
