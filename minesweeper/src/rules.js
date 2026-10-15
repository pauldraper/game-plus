import { assertMinefield, assertPosition, assertState, NotImplementedError } from './model.js';

/** Return surrounding [row, column] pairs in row-major order; exclude self. */
export function getNeighbors(mines, row, column) {
  assertMinefield(mines); assertPosition(mines, row, column);
  throw new NotImplementedError('getNeighbors');
}

/** Count mines among the surrounding eight positions, never the selected cell. */
export function countAdjacentMines(mines, row, column) {
  assertMinefield(mines); assertPosition(mines, row, column);
  throw new NotImplementedError('countAdjacentMines');
}

/**
 * Return newly exposed SAFE cells, in row-major order, without changing state.
 * A blocked start (mine, flag, already revealed) returns []. From an unflagged
 * hidden zero, open its zero region and numbered boundary. Existing revealed
 * zeros may connect that region. Flags block traversal and exposure. The query
 * does not relocate mines or inspect status; use the prepared state supplied
 * to revealCell. No mine may appear in the result.
 */
export function getRevealCells(state, row, column) {
  assertState(state); assertPosition(state.mines, row, column);
  throw new NotImplementedError('getRevealCells');
}

/** True iff all safe cells are revealed and no mine is revealed. Ignore flags. */
export function isWon(state) {
  assertState(state);
  throw new NotImplementedError('isWon');
}
