/** Reference solution. Open only after your independent practice attempt. */
import {
  SIZE, BLACK, WHITE, EMPTY, assertBoard, assertPlayer, assertMove,
  cloneBoard, otherPlayer, InvalidMoveError,
} from './model.js';

const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1],
];
const inBounds = (row, col) => row >= 0 && row < SIZE && col >= 0 && col < SIZE;

// Private core: callers validate the board once before repeated directional scans.
function findFlips(board, player, move) {
  if (board[move.row][move.col] !== EMPTY) return [];
  const opponent = otherPlayer(player);
  const flips = [];
  for (const [dr, dc] of DIRECTIONS) {
    const line = [];
    let row = move.row + dr;
    let col = move.col + dc;
    while (inBounds(row, col) && board[row][col] === opponent) {
      line.push({ row, col });
      row += dr;
      col += dc;
    }
    if (line.length && inBounds(row, col) && board[row][col] === player) {
      flips.push(...line);
    }
  }
  return flips;
}

export function getFlips(board, player, move) {
  assertBoard(board); assertPlayer(player); assertMove(move);
  return findFlips(board, player, move);
}

export function getLegalMoves(board, player) {
  assertBoard(board); assertPlayer(player);
  const moves = [];
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const move = { row, col };
      if (findFlips(board, player, move).length) moves.push(move);
    }
  }
  return moves;
}

export function applyMove(board, player, move) {
  assertBoard(board); assertPlayer(player); assertMove(move);
  const flips = findFlips(board, player, move);
  if (!flips.length) throw new InvalidMoveError('That square does not capture an opposing disc.');
  // Determine all captures against the original position: flips cannot create chain captures.
  const next = cloneBoard(board);
  next[move.row][move.col] = player;
  for (const { row, col } of flips) next[row][col] = player;
  return next;
}

export function countDiscs(board) {
  assertBoard(board);
  const result = { black: 0, white: 0, empty: 0 };
  for (const row of board) {
    for (const cell of row) {
      if (cell === BLACK) result.black++;
      else if (cell === WHITE) result.white++;
      else result.empty++;
    }
  }
  return result;
}
