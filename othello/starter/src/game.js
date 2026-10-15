/** CHALLENGE: complete playMove and passTurn. Setup and result formatting are supplied. */
import {
  BLACK, WHITE, createInitialBoard, assertState, cloneBoard, otherPlayer,
  InvalidMoveError, NotImplementedError,
} from './model.js';
import { getLegalMoves, applyMove, countDiscs } from './rules.js';

/** @returns {import('./model.js').GameState} */
export function createGame() {
  return { board: createInitialBoard(), player: BLACK, status: 'playing' };
}

/**
 * @param {import('./model.js').GameState} state
 * @param {import('./model.js').Move} move
 * @returns {import('./model.js').GameState} New state; next player is the opponent.
 * Finish immediately when neither player can move. Otherwise keep status playing.
 * Do not silently skip a blocked opponent; they must use passTurn.
 */
export function playMove(state, move) {
  assertState(state);
  // TODO 5
  throw new NotImplementedError('playMove');
}

/**
 * @param {import('./model.js').GameState} state
 * @returns {import('./model.js').GameState} New state and independent board.
 * Reject passing when a legal move exists or the game is already finished.
 * If neither player can move, finish and retain state.player; otherwise switch player.
 */
export function passTurn(state) {
  assertState(state);
  // TODO 6
  throw new NotImplementedError('passTurn');
}

/**
 * Only final results have a winner or draw. Supplied, not a challenge stub.
 * @param {import('./model.js').GameState} state
 * @returns {null|{black: number, white: number, empty: number, winner: 'B'|'W'|null, draw: boolean}}
 */
export function getResult(state) {
  assertState(state);
  if (state.status !== 'finished') return null;
  const counts = countDiscs(state.board);
  const winner = counts.black === counts.white ? null :
    counts.black > counts.white ? BLACK : WHITE;
  return { ...counts, winner, draw: winner === null };
}
