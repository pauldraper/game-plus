/** Complete reference implementation. Open after your practice attempt. */
import {
  ROWS,
  COLS,
  CONNECT,
  EMPTY,
  assertBoard,
  assertColumn,
  assertPlayer,
  cloneBoard,
  InvalidMoveError,
} from '../../src/model.js';

/** @param {import('../../src/model.js').Board} board @param {number} column @returns {number} */
export function getDropRow(board, column) {
  assertBoard(board);
  assertColumn(column);
  for (let row = ROWS - 1; row >= 0; row -= 1) {
    if (board[row][column] === EMPTY) return row;
  }
  return -1;
}

/** @param {import('../../src/model.js').Board} board @returns {number[]} */
export function getLegalColumns(board) {
  assertBoard(board);
  if (getWinner(board) !== null) return [];
  const columns = [];
  for (let col = 0; col < COLS; col += 1) {
    if (getDropRow(board, col) !== -1) columns.push(col);
  }
  return columns;
}

/**
 * Enumerate bounded four-cell windows. Only four directions are needed because
 * reversing a line cannot change whether its discs match.
 * @param {import('../../src/model.js').Board} board
 * @returns {import('../../src/model.js').Player|null}
 */
export function getWinner(board) {
  assertBoard(board);
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const player = board[row][col];
      if (player === EMPTY) continue;
      for (const [dr, dc] of directions) {
        const lastRow = row + (CONNECT - 1) * dr;
        const lastCol = col + (CONNECT - 1) * dc;
        if (lastRow < 0 || lastRow >= ROWS || lastCol < 0 || lastCol >= COLS) continue;
        let matches = true;
        for (let offset = 1; offset < CONNECT; offset += 1) {
          if (board[row + offset * dr][col + offset * dc] !== player) {
            matches = false;
            break;
          }
        }
        if (matches) return player;
      }
    }
  }
  return null;
}

/** @param {import('../../src/model.js').Board} board @returns {boolean} */
export function isDraw(board) {
  assertBoard(board);
  // Winner evaluation takes priority even when the winning move fills the board.
  return getWinner(board) === null && board.every((row) => row.every((cell) => cell !== EMPTY));
}

/**
 * @param {import('../../src/model.js').Board} board
 * @param {import('../../src/model.js').Player} player
 * @param {number} column
 * @returns {import('../../src/model.js').Board}
 */
export function dropDisc(board, player, column) {
  assertBoard(board);
  assertPlayer(player);
  assertColumn(column);
  if (getWinner(board) !== null) throw new InvalidMoveError('Game already has a winner.');
  const row = getDropRow(board, column);
  if (row === -1) throw new InvalidMoveError('Column is full.');
  const next = cloneBoard(board);
  next[row][column] = player;
  return next;
}
