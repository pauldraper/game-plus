import { assertFlagAction, cloneState } from '../../src/model.js';
import { prepareReveal } from '../../src/state.js';
import { getRevealCells, isWon } from './rules.js';

/**
 * Applies a reveal to an independent state, using supplied protection/validation.
 * A mine hit records only the detonated cell in storage; presentation can show
 * the other mines without mutating their revealed flags.
 * @param {import('../../src/model.js').State} state
 * @returns {import('../../src/model.js').State} Updated state; input remains unchanged.
 */
export function revealCell(state, row, column) {
  const next = prepareReveal(state, row, column);
  if (next.mines[row][column]) {
    next.revealed[row][column] = true;
    next.status = 'lost';
    next.exploded = [row, column];
    return next;
  }
  for (const [r, c] of getRevealCells(next, row, column)) next.revealed[r][c] = true;
  next.status = isWon(next) ? 'won' : 'playing';
  return next;
}
/** Toggles one hidden cell's flag on a copied state; does not consume protection. */
export function toggleFlag(state, row, column) {
  assertFlagAction(state, row, column);
  const next = cloneState(state);
  next.flagged[row][column] = !next.flagged[row][column];
  return next;
}
