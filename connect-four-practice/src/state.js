/** Supplied state initialization, result formatting, and fixture loading. */
import { RED, assertGravity, assertState, countDiscs, createBoard } from './model.js';

/** @returns {import('./model.js').GameState} */
export function createInitialState() {
  return { board: createBoard(), player: RED, status: 'playing', winner: null };
}

/**
 * Uses the lifecycle's terminal metadata, not its own winner-detection algorithm.
 * @param {import('./model.js').GameState} state
 * @returns {null|{winner: import('./model.js').Player|null, draw: boolean, red: number, yellow: number, empty: number}}
 */
export function getResult(state) {
  assertState(state);
  if (state.status === 'playing') return null;
  return { winner: state.winner, draw: state.winner === null, ...countDiscs(state.board) };
}

/**
 * Convert a JSON fixture's row strings to arrays. Checks shape and gravity,
 * but does not prove that the position or terminal metadata is reachable.
 * @param {string} text
 * @returns {import('./model.js').GameState}
 */
export function parsePosition(text) {
  const data = JSON.parse(text);
  if (data === null || typeof data !== 'object' || !Array.isArray(data.rows)
      || data.rows.some(row => typeof row !== 'string')) {
    throw new TypeError('Position must contain a rows array of strings.');
  }
  const state = {
    board: data.rows.map(row => [...row]),
    player: data.player,
    status: data.status,
    winner: data.winner,
  };
  assertState(state);
  assertGravity(state.board);
  return state;
}
