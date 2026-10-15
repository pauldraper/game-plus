import { SIZE, EMPTY } from './implementation.js';

export function emptyBoard() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(EMPTY));
}
export function fromRows(...rows) {
  return rows.map((row) => [...row]);
}
export function keys(moves) {
  return moves.map(({ row, col }) => `${row},${col}`).sort();
}
export function freezeDeep(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(freezeDeep);
  }
  return value;
}
export function state(board, player = 'B', status = 'playing') {
  return { board, player, status };
}
export function forcedPassBoard() {
  return fromRows('.BWBBBBB', ...Array(7).fill('BBBBBBBB'));
}
export function blockedBoard() {
  return fromRows('.BBBBBBB', ...Array(7).fill('BBBBBBBB'));
}
export function lastDrawBoard() {
  return fromRows('.WBBBBBB', ...Array(3).fill('BBBBBBBB'), ...Array(4).fill('WWWWWWWW'));
}
