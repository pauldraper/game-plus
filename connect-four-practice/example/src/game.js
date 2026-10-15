/** Complete lifecycle implementation; depends on example/src/rules.js, not the stubs. */
import { assertColumn, assertState, InvalidMoveError, otherPlayer } from '../../src/model.js';
import { dropDisc, getWinner, isDraw } from './rules.js';

/**
 * @param {import('../../src/model.js').GameState} state
 * @param {number} column
 * @returns {import('../../src/model.js').GameState}
 */
export function playMove(state, column) {
  assertState(state);
  assertColumn(column);
  if (state.status === 'finished') throw new InvalidMoveError('Game is already finished.');
  const board = dropDisc(state.board, state.player, column);
  const winner = getWinner(board);
  const finished = winner !== null || isDraw(board);
  return {
    board,
    player: finished ? state.player : otherPlayer(state.player),
    status: finished ? 'finished' : 'playing',
    winner,
  };
}
