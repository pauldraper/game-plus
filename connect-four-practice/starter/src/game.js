/** PRACTICE FILE: implement the turn transition without changing the CLI. */
import { assertColumn, assertState, InvalidMoveError, NotImplementedError } from './model.js';

/**
 * Make a legal move and return a new state. Switch players only if play continues.
 * On a win or draw, set status='finished' and retain the player who just moved.
 * On a win, set winner to that player; on a draw, keep winner=null.
 * Reject completed games and illegal actions without mutating state.
 * @param {import('./model.js').GameState} state
 * @param {number} column Zero-based.
 * @returns {import('./model.js').GameState}
 */
export function playMove(state, column) {
  assertState(state);
  assertColumn(column);
  if (state.status === 'finished') {
    throw new InvalidMoveError('Game is already finished.');
  }
  throw new NotImplementedError('playMove', 'src/game.js');
}
