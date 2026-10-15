/**
 * CHALLENGE: implement these four public functions. Keep signatures unchanged.
 * Public input validation is supplied. Do not remove it.
 * Consult docs/CHALLENGE.md for contracts.
 */
import {
  SIZE, BLACK, WHITE, EMPTY, assertBoard, assertPlayer, assertMove,
  cloneBoard, otherPlayer, InvalidMoveError, NotImplementedError,
} from './model.js';

/**
 * @param {import('./model.js').Board} board
 * @param {import('./model.js').Player} player
 * @param {import('./model.js').Move} move
 * @returns {import('./model.js').Move[]} Captured coordinates; order is not significant.
 * Return [] for an occupied cell or a move with no captures. Never mutate board.
 */
export function getFlips(board, player, move) {
  assertBoard(board);
  assertPlayer(player);
  assertMove(move);
  // TODO 1
  throw new NotImplementedError('getFlips');
}

/**
 * @param {import('./model.js').Board} board
 * @param {import('./model.js').Player} player
 * @returns {import('./model.js').Move[]} All legal moves, in row-major order.
 */
export function getLegalMoves(board, player) {
  assertBoard(board);
  assertPlayer(player);
  // TODO 2
  throw new NotImplementedError('getLegalMoves');
}

/**
 * @param {import('./model.js').Board} board
 * @param {import('./model.js').Player} player
 * @param {import('./model.js').Move} move
 * @returns {import('./model.js').Board} New, independent board after a legal move.
 * Throw InvalidMoveError for an occupied square or a move that captures nothing.
 */
export function applyMove(board, player, move) {
  assertBoard(board);
  assertPlayer(player);
  assertMove(move);
  // TODO 3
  throw new NotImplementedError('applyMove');
}

/**
 * @param {import('./model.js').Board} board
 * @returns {{black: number, white: number, empty: number}}
 */
export function countDiscs(board) {
  assertBoard(board);
  // TODO 4
  throw new NotImplementedError('countDiscs');
}
