import { assertFlagAction, NotImplementedError } from './model.js';
import { prepareReveal } from './state.js';
// Import your functions from './rules.js' as needed; do not import example/.

/**
 * Return a NEW state after revealing a valid hidden, unflagged cell. prepareReveal
 * supplies validation, a deep-enough copy, and first-reveal mine relocation.
 * Mine: reveal that mine, set status='lost', exploded=[row,column].
 * Safe: reveal getRevealCells(...); set status='won' iff isWon(...), else 'playing'.
 */
export function revealCell(state, row, column) {
  const next = prepareReveal(state, row, column);
  void next; // Remove this line when implementing the remaining behavior.
  throw new NotImplementedError('revealCell');
}

/** Toggle one hidden cell's flag in a NEW state. Preserve status/protection. */
export function toggleFlag(state, row, column) {
  assertFlagAction(state, row, column);
  throw new NotImplementedError('toggleFlag');
}
