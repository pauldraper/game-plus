/** Shared, supplied model helpers. No game-rule implementation is hidden here. */
export class InvalidMoveError extends Error {
  constructor(message) { super(message); this.name = 'InvalidMoveError'; }
}
export class NotImplementedError extends Error {
  constructor(name) { super(`Not implemented: ${name}`); this.name = 'NotImplementedError'; }
}

/** @typedef {boolean[][]} Grid */
/**
 * @typedef {object} State
 * @property {Grid} mines Fixed mine positions, except supplied first-reveal protection.
 * @property {Grid} revealed
 * @property {Grid} flagged
 * @property {'playing'|'won'|'lost'} status
 * @property {[number, number] | null} exploded
 * @property {boolean} firstRevealPending Whether the next successful reveal is protected.
 */
export function assertDimensions(rows, columns) {
  if (!Number.isInteger(rows) || !Number.isInteger(columns)) {
    throw new TypeError('Dimensions must be integers.');
  }
  if (rows < 1 || rows > 256 || columns < 1 || columns > 256) {
    throw new RangeError('Dimensions must be between 1 and 256.');
  }
}
export function makeGrid(rows, columns, value = false) {
  assertDimensions(rows, columns);
  if (typeof value !== 'boolean') throw new TypeError('Grid values must be boolean.');
  return Array.from({ length: rows }, () => Array(columns).fill(value));
}
export function assertBooleanGrid(grid, name = 'grid') {
  if (!Array.isArray(grid) || !grid.length || !Array.isArray(grid[0])) {
    throw new TypeError(`${name} must be a nonempty rectangular array.`);
  }
  assertDimensions(grid.length, grid[0].length);
  const width = grid[0].length;
  for (const row of grid) {
    if (!Array.isArray(row) || row.length !== width) throw new TypeError(`${name} must be rectangular.`);
    for (const cell of row) if (typeof cell !== 'boolean') throw new TypeError(`${name} must contain booleans.`);
  }
}
export function assertMinefield(mines) {
  assertBooleanGrid(mines, 'mines');
  if (mines.every(row => row.every(Boolean))) throw new RangeError('At least one cell must be safe.');
}
export function assertPosition(grid, row, column) {
  if (!Number.isInteger(row) || !Number.isInteger(column)) throw new TypeError('Coordinates must be integers.');
  if (row < 0 || row >= grid.length || column < 0 || column >= grid[0].length) {
    throw new RangeError('Coordinate is outside the board.');
  }
}
export function copyGrid(grid) { return grid.map(row => [...row]); }
export function cloneState(state) {
  return { ...state, mines: copyGrid(state.mines), revealed: copyGrid(state.revealed),
    flagged: copyGrid(state.flagged), exploded: state.exploded ? [...state.exploded] : null };
}
export function assertState(state) {
  if (!state || typeof state !== 'object') throw new TypeError('Expected a game state.');
  assertMinefield(state.mines);
  const rows = state.mines.length, columns = state.mines[0].length;
  for (const name of ['revealed', 'flagged']) {
    assertBooleanGrid(state[name], name);
    if (state[name].length !== rows || state[name][0].length !== columns) {
      throw new TypeError('All state grids must have identical dimensions.');
    }
  }
  if (!['playing', 'won', 'lost'].includes(state.status)) throw new TypeError('Invalid status.');
  if (typeof state.firstRevealPending !== 'boolean') throw new TypeError('firstRevealPending must be boolean.');
  let revealedMines = 0, hiddenSafe = 0, anyRevealed = false;
  for (let r = 0; r < rows; r++) for (let c = 0; c < columns; c++) {
    if (state.revealed[r][c] && state.flagged[r][c]) throw new TypeError('A revealed cell cannot be flagged.');
    if (state.revealed[r][c]) anyRevealed = true;
    if (state.mines[r][c] && state.revealed[r][c]) revealedMines++;
    if (!state.mines[r][c] && !state.revealed[r][c]) hiddenSafe++;
  }
  if (state.firstRevealPending && (anyRevealed || state.status !== 'playing')) {
    throw new TypeError('First-reveal protection is only valid before any reveal.');
  }
  if (state.status === 'lost') {
    if (!Array.isArray(state.exploded) || state.exploded.length !== 2) throw new TypeError('Lost state needs an exploded coordinate.');
    const [r, c] = state.exploded;
    assertPosition(state.mines, r, c);
    if (!state.mines[r][c] || !state.revealed[r][c] || revealedMines !== 1) {
      throw new TypeError('A lost state must reveal exactly its exploded mine.');
    }
  } else {
    if (state.exploded !== null || revealedMines) throw new TypeError('Only a lost state may expose a mine.');
    if (state.status === 'won' && hiddenSafe !== 0) throw new TypeError('A won state must expose every safe cell.');
  }
}
export function assertActive(state) {
  assertState(state);
  if (state.status !== 'playing') throw new InvalidMoveError('The game has already ended.');
}
export function assertRevealAction(state, row, column) {
  assertActive(state); assertPosition(state.mines, row, column);
  if (state.flagged[row][column]) throw new InvalidMoveError('Remove the flag before revealing this cell.');
  if (state.revealed[row][column]) throw new InvalidMoveError('This cell is already revealed.');
}
export function assertFlagAction(state, row, column) {
  assertActive(state); assertPosition(state.mines, row, column);
  if (state.revealed[row][column]) throw new InvalidMoveError('A revealed cell cannot be flagged.');
}
export function parseCoordinate(text, rows, columns) {
  if (typeof text !== 'string') throw new TypeError('Coordinate must be text.');
  const match = /^([a-z])([1-9]\d{0,2})$/i.exec(text.trim());
  if (!match) throw new RangeError('Use a coordinate such as A1 or C12.');
  const row = Number(match[2]) - 1, column = match[1].toUpperCase().charCodeAt(0) - 65;
  if (row >= rows || column >= columns) throw new RangeError('Coordinate is outside the board.');
  return [row, column];
}
export function formatCoordinate(row, column) {
  return `${String.fromCharCode(65 + column)}${row + 1}`;
}
