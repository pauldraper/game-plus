/**
 * PRACTICE FILE: implement the five stubs below.
 * Contracts and acceptance requirements are in README.md.
 * Keep the provided validation and do not import example/ during an attempt.
 */
import {
  assertBoard, assertColumn, assertPlayer, NotImplementedError,
} from './model.js';

/**
 * Return the bottommost empty row in a column, or -1 when it is full.
 * This is a placement query only; it does not determine whether a game is over.
 * @param {import('./model.js').Board} board
 * @param {number} column Zero-based.
 * @returns {number}
 */
export function getDropRow(board, column) {
  assertBoard(board);
  assertColumn(column);
  throw new NotImplementedError('getDropRow', 'src/rules.js');
}

/**
 * Return available columns in ascending order, or [] if the board has a winner
 * or no room remains. Never mutate the board.
 * @param {import('./model.js').Board} board
 * @returns {number[]}
 */
export function getLegalColumns(board) {
  assertBoard(board);
  throw new NotImplementedError('getLegalColumns', 'src/rules.js');
}

/**
 * Return R, Y, or null. A win is at least four contiguous matching discs
 * horizontally, vertically, or along either diagonal. Never mutate the board.
 * Positions with wins for both players are outside the input contract.
 * @param {import('./model.js').Board} board
 * @returns {import('./model.js').Player|null}
 */
export function getWinner(board) {
  assertBoard(board);
  throw new NotImplementedError('getWinner', 'src/rules.js');
}

/**
 * Return true only for a full board without a winner.
 * @param {import('./model.js').Board} board
 * @returns {boolean}
 */
export function isDraw(board) {
  assertBoard(board);
  throw new NotImplementedError('isDraw', 'src/rules.js');
}

/**
 * Return a new board with one disc dropped into the selected column.
 * Reject full columns and already-won boards with InvalidMoveError.
 * All output row arrays must be independent of the input's rows.
 * @param {import('./model.js').Board} board
 * @param {import('./model.js').Player} player
 * @param {number} column
 * @returns {import('./model.js').Board}
 */
export function dropDisc(board, player, column) {
  assertBoard(board);
  assertPlayer(player);
  assertColumn(column);
  throw new NotImplementedError('dropDisc', 'src/rules.js');
}
