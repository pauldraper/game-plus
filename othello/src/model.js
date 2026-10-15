/** Shared types, validation, and setup. Supplied infrastructure: do not edit. */

/** @typedef {'B'|'W'} Player */
/** @typedef {Player|'.'} Cell */
/** @typedef {Cell[][]} Board */
/** @typedef {{row: number, col: number}} Move */
/** @typedef {{board: Board, player: Player, status: 'playing'|'finished'}} GameState */

export const SIZE = 8;
export const BLACK = 'B';
export const WHITE = 'W';
export const EMPTY = '.';

export class InvalidMoveError extends Error {
  constructor(message) { super(message); this.name = 'InvalidMoveError'; }
}

export class NotImplementedError extends Error {
  constructor(method) {
    super(`Implement ${method} before using this feature.`);
    this.name = 'NotImplementedError';
  }
}

/** @param {unknown} player @returns {asserts player is Player} */
export function assertPlayer(player) {
  if (player !== BLACK && player !== WHITE) {
    throw new TypeError('Player must be B or W.');
  }
}

/** Validate every cell, including sparse array entries. @param {unknown} board */
export function assertBoard(board) {
  if (!Array.isArray(board) || board.length !== SIZE) {
    throw new TypeError('Board must have exactly eight rows.');
  }
  for (let row = 0; row < SIZE; row++) {
    if (!Array.isArray(board[row]) || board[row].length !== SIZE) {
      throw new TypeError('Every board row must have eight cells.');
    }
    for (let col = 0; col < SIZE; col++) {
      if (![BLACK, WHITE, EMPTY].includes(board[row][col])) {
        throw new TypeError('Board cells must be B, W, or a period.');
      }
    }
  }
}

/** @param {unknown} move */
export function assertMove(move) {
  if (!move || typeof move !== 'object' ||
      !Number.isInteger(move.row) || !Number.isInteger(move.col)) {
    throw new TypeError('A move needs integer row and col coordinates.');
  }
  if (move.row < 0 || move.row >= SIZE || move.col < 0 || move.col >= SIZE) {
    throw new RangeError('Move is outside the board.');
  }
}

/** @param {unknown} state */
export function assertState(state) {
  if (!state || typeof state !== 'object') throw new TypeError('Invalid game state.');
  assertBoard(state.board);
  assertPlayer(state.player);
  if (!['playing', 'finished'].includes(state.status)) {
    throw new TypeError('Status must be playing or finished.');
  }
}

/** @param {Player} player @returns {Player} */
export function otherPlayer(player) {
  assertPlayer(player);
  return player === BLACK ? WHITE : BLACK;
}

/** @param {Board} board @returns {Board} */
export function cloneBoard(board) {
  assertBoard(board);
  return board.map(row => [...row]);
}

/** @returns {Board} */
export function createInitialBoard() {
  const board = Array.from({ length: SIZE }, () => Array(SIZE).fill(EMPTY));
  board[3][3] = WHITE;
  board[3][4] = BLACK;
  board[4][3] = BLACK;
  board[4][4] = WHITE;
  return board;
}
