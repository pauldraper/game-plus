/** Reference solution. State transitions use explicit, forced passes. */
import {
  BLACK, WHITE, createInitialBoard, assertState, cloneBoard, otherPlayer, InvalidMoveError,
} from './model.js';
import { getLegalMoves, applyMove, countDiscs } from './rules.js';

export function createGame() {
  return { board: createInitialBoard(), player: BLACK, status: 'playing' };
}

export function playMove(state, move) {
  assertState(state);
  if (state.status === 'finished') throw new InvalidMoveError('The game is already finished.');
  const board = applyMove(state.board, state.player, move);
  const player = otherPlayer(state.player);
  const finished = !getLegalMoves(board, player).length &&
    !getLegalMoves(board, state.player).length;
  return { board, player, status: finished ? 'finished' : 'playing' };
}

export function passTurn(state) {
  assertState(state);
  if (state.status === 'finished') throw new InvalidMoveError('The game is already finished.');
  if (getLegalMoves(state.board, state.player).length) {
    throw new InvalidMoveError('You must move when a legal move is available.');
  }
  const nextPlayer = otherPlayer(state.player);
  const finished = !getLegalMoves(state.board, nextPlayer).length;
  return {
    board: cloneBoard(state.board),
    player: finished ? state.player : nextPlayer,
    status: finished ? 'finished' : 'playing',
  };
}

export function getResult(state) {
  assertState(state);
  if (state.status !== 'finished') return null;
  const counts = countDiscs(state.board);
  const winner = counts.black === counts.white ? null :
    counts.black > counts.white ? BLACK : WHITE;
  return { ...counts, winner, draw: winner === null };
}
