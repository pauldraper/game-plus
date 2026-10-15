import { assertMinefield, assertPosition, assertState } from '../../src/model.js';

// Internal helpers avoid revalidating an entire board at every BFS step.
function neighborsOf(mines, row, column) {
  const result = [];
  for (let r = row - 1; r <= row + 1; r++)
    for (let c = column - 1; c <= column + 1; c++) {
      if (
        r >= 0 &&
        r < mines.length &&
        c >= 0 &&
        c < mines[0].length &&
        (r !== row || c !== column)
      )
        result.push([r, c]);
    }
  return result;
}
function countAt(mines, row, column) {
  let count = 0;
  for (const [r, c] of neighborsOf(mines, row, column)) if (mines[r][c]) count++;
  return count;
}
/**
 * Returns in-bounds surrounding coordinates in row-major order, excluding self.
 * @param {boolean[][]} mines - Rectangular mine layout, independent of visibility.
 * @returns {number[][]} Fresh coordinate pairs; input is never modified.
 */
export function getNeighbors(mines, row, column) {
  assertMinefield(mines);
  assertPosition(mines, row, column);
  return neighborsOf(mines, row, column);
}
/** Counts neighboring mines, even if the selected cell itself contains a mine. */
export function countAdjacentMines(mines, row, column) {
  assertMinefield(mines);
  assertPosition(mines, row, column);
  return countAt(mines, row, column);
}
/**
 * Collects newly exposed safe cells without changing the supplied state.
 * Flags block traversal; already revealed zeros may connect regions but are
 * omitted from the result. Use the prepared state after first-click relocation.
 * @param {import('../../src/model.js').State} state
 * @returns {number[][]} Coordinates sorted into row-major order.
 */
export function getRevealCells(state, row, column) {
  assertState(state);
  assertPosition(state.mines, row, column);
  const { mines, revealed, flagged } = state;
  if (mines[row][column] || flagged[row][column] || revealed[row][column]) return [];
  const width = mines[0].length;
  const visited = new Set([row * width + column]);
  const queue = [[row, column]];
  const result = [];
  // A cursor avoids the repeated copying cost of Array.shift().
  for (let head = 0; head < queue.length; head++) {
    const [r, c] = queue[head];
    if (!revealed[r][c]) result.push([r, c]);
    if (countAt(mines, r, c) !== 0) continue;
    for (const [nr, nc] of neighborsOf(mines, r, c)) {
      const key = nr * width + nc;
      if (visited.has(key) || flagged[nr][nc] || mines[nr][nc]) continue;
      // Mark when enqueueing so cycles and multiple neighbors cannot add duplicates.
      visited.add(key);
      queue.push([nr, nc]);
    }
  }
  // Stable API order, regardless of traversal order.
  return result.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}
/** Derives completion from visibility: all safe cells open, no mine exposed. */
export function isWon(state) {
  assertState(state);
  for (let r = 0; r < state.mines.length; r++)
    for (let c = 0; c < state.mines[0].length; c++) {
      if (state.mines[r][c] && state.revealed[r][c]) return false;
      if (!state.mines[r][c] && !state.revealed[r][c]) return false;
    }
  return true;
}
