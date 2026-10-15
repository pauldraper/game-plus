import {
  createGame,
  playMove,
  passTurn,
  getResult,
  createInitialBoard,
  getLegalMoves,
} from './implementation.js';
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  fromRows,
  freezeDeep,
  state,
  forcedPassBoard,
  blockedBoard,
  lastDrawBoard,
} from './helpers.js';

test('turns: a legal move switches players', () => {
  const before = freezeDeep(createGame());
  const next = playMove(before, { row: 2, col: 3 });
  assert.equal(next.player, 'W');
  assert.equal(next.status, 'playing');
  assert.equal(next.board[2][3], 'B');
  assert.deepEqual(before.board, createInitialBoard());
});
test('turns: invalid moves do not consume a turn', () => {
  const before = freezeDeep(createGame());
  assert.throws(() => playMove(before, { row: 0, col: 0 }), { name: 'InvalidMoveError' });
  assert.equal(before.player, 'B');
  assert.deepEqual(before.board, createInitialBoard());
});
test('turns: a blocked opponent remains the next player until an explicit pass', () => {
  const board = fromRows('.WBBBBBB', ...Array(6).fill('BBBBBBBB'), 'BBBBBBW.');
  const next = playMove(state(board), { row: 0, col: 0 });
  assert.equal(next.player, 'W');
  assert.equal(next.status, 'playing');
  assert.deepEqual(getLegalMoves(next.board, 'W'), []);
  assert.equal(getLegalMoves(next.board, 'B').length, 1);
  const resumed = passTurn(next);
  assert.equal(resumed.player, 'B');
  assert.equal(resumed.status, 'playing');
});
test('passes: passing is forbidden when a move exists', () => {
  assert.throws(() => passTurn(createGame()), { name: 'InvalidMoveError' });
});
test('passes: a forced pass switches players without changing the board', () => {
  const before = freezeDeep(state(forcedPassBoard()));
  const next = passTurn(before);
  assert.equal(next.player, 'W');
  assert.equal(next.status, 'playing');
  assert.deepEqual(next.board, before.board);
  assert.notEqual(next.board, before.board);
  before.board.forEach((row, i) => assert.notEqual(row, next.board[i]));
});
test('passes: neither player can move, so finish even with empty cells', () => {
  const next = passTurn(state(blockedBoard()));
  assert.equal(next.status, 'finished');
  assert.equal(next.player, 'B');
  assert.deepEqual(getResult(next), { black: 63, white: 0, empty: 1, winner: 'B', draw: false });
});
test('completion: last move on a full board produces a draw', () => {
  const next = playMove(state(lastDrawBoard()), { row: 0, col: 0 });
  assert.equal(next.status, 'finished');
  assert.equal(next.player, 'W');
  assert.deepEqual(getResult(next), { black: 32, white: 32, empty: 0, winner: null, draw: true });
});
test('completion: a move can end the game before the board is full', () => {
  const board = fromRows('.WBBBBBB', ...Array(6).fill('BBBBBBBB'), 'BBBBBBB.');
  const next = playMove(state(board), { row: 0, col: 0 });
  assert.equal(next.status, 'finished');
  assert.deepEqual(getResult(next), { black: 63, white: 0, empty: 1, winner: 'B', draw: false });
});
test('completion: White victory is not interpreted as Black victory', () => {
  const board = fromRows('.BWWWWWW', ...Array(7).fill('WWWWWWWW'));
  const next = playMove(state(board, 'W'), { row: 0, col: 0 });
  assert.deepEqual(getResult(next), { black: 0, white: 64, empty: 0, winner: 'W', draw: false });
});
test('completion: moves and passes are rejected after the game ends', () => {
  const ended = state(createInitialBoard(), 'B', 'finished');
  assert.throws(() => playMove(ended, { row: 2, col: 3 }), { name: 'InvalidMoveError' });
  assert.throws(() => passTurn(ended), { name: 'InvalidMoveError' });
});
test('completion: an active position has no final result', () => {
  assert.equal(getResult(createGame()), null);
});
test('state validation: unknown status remains an error', () => {
  const bad = { ...createGame(), status: 'unknown' };
  assert.throws(() => playMove(bad, { row: 2, col: 3 }), TypeError);
  assert.throws(() => passTurn(bad), TypeError);
});
