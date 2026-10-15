/** Supplied data model and validation. No winning-line or move logic lives here. */
export const ROWS = 6;
export const COLS = 7;
export const CONNECT = 4;
export const EMPTY = '.';
export const RED = 'R';
export const YELLOW = 'Y';

/** @typedef {'R'|'Y'} Player */
/** @typedef {'.'|Player} Cell */
/** @typedef {Cell[][]} Board */
/** @typedef {{board: Board, player: Player, status: 'playing'|'finished', winner: Player|null}} GameState */

export class InvalidMoveError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidMoveError';
  }
}

export class NotImplementedError extends Error {
  constructor(method, file) {
    super(`Not implemented: ${method}. Complete ${file}.`);
    this.name = 'NotImplementedError';
  }
}

/** @param {unknown} player */
export function assertPlayer(player) {
  if (player !== RED && player !== YELLOW) {
    throw new TypeError('Player must be R or Y.');
  }
}

/** @param {unknown} column */
export function assertColumn(column) {
  if (!Number.isInteger(column)) {
    throw new TypeError('Column must be an integer.');
  }
  if (column < 0 || column >= COLS) {
    throw new RangeError(`Column must be between 0 and ${COLS - 1}.`);
  }
}

/** Enforce shape and cell values, not historical reachability. @param {unknown} board */
export function assertBoard(board) {
  if (!Array.isArray(board) || board.length !== ROWS) {
    throw new TypeError(`Board must contain ${ROWS} rows.`);
  }
  for (let row = 0; row < ROWS; row += 1) {
    if (!Array.isArray(board[row]) || board[row].length !== COLS) {
      throw new TypeError(`Each board row must contain ${COLS} cells.`);
    }
    for (let col = 0; col < COLS; col += 1) {
      const cell = board[row][col];
      if (cell !== EMPTY && cell !== RED && cell !== YELLOW) {
        throw new TypeError('Board cells must be ., R, or Y.');
      }
    }
  }
}

/** Extra validation for imported CLI positions. @param {Board} board */
export function assertGravity(board) {
  assertBoard(board);
  for (let col = 0; col < COLS; col += 1) {
    let emptyBelow = false;
    for (let row = ROWS - 1; row >= 0; row -= 1) {
      if (board[row][col] === EMPTY) emptyBelow = true;
      else if (emptyBelow) throw new TypeError('Position has a floating disc.');
    }
  }
}

/** @param {unknown} state */
export function assertState(state) {
  if (state === null || typeof state !== 'object') {
    throw new TypeError('State must be an object.');
  }
  assertBoard(state.board);
  assertPlayer(state.player);
  if (state.status !== 'playing' && state.status !== 'finished') {
    throw new TypeError('State status must be playing or finished.');
  }
  if (state.winner !== null && state.winner !== RED && state.winner !== YELLOW) {
    throw new TypeError('State winner must be R, Y, or null.');
  }
  if (state.status === 'playing' && state.winner !== null) {
    throw new TypeError('An active game cannot already have a winner.');
  }
}

/** @returns {Board} */
export function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));
}

/** Copy every row, not only the outer array. @param {Board} board @returns {Board} */
export function cloneBoard(board) {
  assertBoard(board);
  return board.map(row => row.slice());
}

/** @param {Player} player @returns {Player} */
export function otherPlayer(player) {
  assertPlayer(player);
  return player === RED ? YELLOW : RED;
}

/** @param {Board} board @returns {{red: number, yellow: number, empty: number}} */
export function countDiscs(board) {
  assertBoard(board);
  const counts = { red: 0, yellow: 0, empty: 0 };
  for (const row of board) {
    for (const cell of row) {
      if (cell === RED) counts.red += 1;
      else if (cell === YELLOW) counts.yellow += 1;
      else counts.empty += 1;
    }
  }
  return counts;
}
