import {
  createInitialBoard,
  getFlips,
  getLegalMoves,
  applyMove,
  countDiscs,
} from './implementation.js';
import test from 'node:test';
import assert from 'node:assert/strict';

import { emptyBoard, fromRows, keys, freezeDeep } from './helpers.js';

for (const [label, dr, dc] of [
  ['northwest', -1, -1],
  ['north', -1, 0],
  ['northeast', -1, 1],
  ['west', 0, -1],
  ['east', 0, 1],
  ['southwest', 1, -1],
  ['south', 1, 0],
  ['southeast', 1, 1],
]) {
  test(`captures: a bracketed line to the ${label}`, () => {
    const board = emptyBoard();
    board[3 + dr][3 + dc] = 'W';
    board[3 + 2 * dr][3 + 2 * dc] = 'B';
    assert.deepEqual(getFlips(board, 'B', { row: 3, col: 3 }), [{ row: 3 + dr, col: 3 + dc }]);
  });
}
test('captures: multiple opposing discs in one line', () => {
  const board = emptyBoard();
  board[2] = [...'.WWWB...'];
  assert.deepEqual(keys(getFlips(board, 'B', { row: 2, col: 0 })), ['2,1', '2,2', '2,3']);
});
test('captures: every qualifying direction is included without duplicates', () => {
  const board = emptyBoard();
  const expected = [];
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      board[3 + dr][3 + dc] = 'W';
      board[3 + 2 * dr][3 + 2 * dc] = 'B';
      expected.push({ row: 3 + dr, col: 3 + dc });
    }
  assert.deepEqual(keys(getFlips(board, 'B', { row: 3, col: 3 })), keys(expected));
  const next = applyMove(board, 'B', { row: 3, col: 3 });
  expected.forEach(({ row, col }) => assert.equal(next[row][col], 'B'));
});
test('captures: White follows the same rule', () => {
  assert.deepEqual(getFlips(createInitialBoard(), 'W', { row: 2, col: 4 }), [{ row: 3, col: 4 }]);
});
test('captures: occupied cells have no captures', () => {
  const board = createInitialBoard();
  assert.deepEqual(getFlips(board, 'B', { row: 3, col: 3 }), []);
  assert.deepEqual(getFlips(board, 'B', { row: 3, col: 4 }), []);
});
test('captures: an empty gap breaks a bracket', () => {
  const board = emptyBoard();
  board[0] = [...'.W.B....'];
  assert.deepEqual(getFlips(board, 'B', { row: 0, col: 0 }), []);
});
test('captures: an adjacent friendly disc does not capture', () => {
  const board = emptyBoard();
  board[0] = [...'.BWB....'];
  assert.deepEqual(getFlips(board, 'B', { row: 0, col: 0 }), []);
});
test('captures: opponents extending to the edge are not bracketed', () => {
  const board = emptyBoard();
  board[0] = [...'.WWWWWWW'];
  assert.deepEqual(getFlips(board, 'B', { row: 0, col: 0 }), []);
});
test('captures: board edges cannot wrap into the next row', () => {
  const board = emptyBoard();
  board[4][0] = 'W';
  board[4][1] = 'B';
  assert.deepEqual(getFlips(board, 'B', { row: 3, col: 7 }), []);
});
test('captures: a corner can capture horizontally and diagonally', () => {
  const board = emptyBoard();
  board[0][1] = 'W';
  board[0][2] = 'B';
  board[1][1] = 'W';
  board[2][2] = 'B';
  assert.deepEqual(keys(getFlips(board, 'B', { row: 0, col: 0 })), ['0,1', '1,1']);
});
test('captures: querying never changes a frozen board', () => {
  const board = freezeDeep(createInitialBoard());
  assert.deepEqual(getFlips(board, 'B', { row: 2, col: 3 }), [{ row: 3, col: 3 }]);
  assert.equal(board[3][3], 'W');
});
test('moves: Black opening moves are complete and row-major', () => {
  assert.deepEqual(getLegalMoves(createInitialBoard(), 'B'), [
    { row: 2, col: 3 },
    { row: 3, col: 2 },
    { row: 4, col: 5 },
    { row: 5, col: 4 },
  ]);
});
test('moves: White opening moves are complete and row-major', () => {
  assert.deepEqual(getLegalMoves(createInitialBoard(), 'W'), [
    { row: 2, col: 4 },
    { row: 3, col: 5 },
    { row: 4, col: 2 },
    { row: 5, col: 3 },
  ]);
});
test('moves: an empty board offers no legal moves', () => {
  assert.deepEqual(getLegalMoves(emptyBoard(), 'B'), []);
});
test('moves: a full board offers no legal moves', () => {
  assert.deepEqual(getLegalMoves(fromRows(...Array(8).fill('BBBBBBBB')), 'W'), []);
});
test('moves: returned coordinates are not shared across calls', () => {
  const board = createInitialBoard();
  const moves = getLegalMoves(board, 'B');
  assert.equal(moves.length, 4);
  moves[0].row = 99;
  assert.equal(getLegalMoves(board, 'B')[0].row, 2);
});
test('apply: Black D3 places and flips exactly the specified cells', () => {
  const board = freezeDeep(createInitialBoard());
  const next = applyMove(board, 'B', { row: 2, col: 3 });
  const expected = createInitialBoard();
  expected[2][3] = 'B';
  expected[3][3] = 'B';
  assert.deepEqual(next, expected);
  assert.notEqual(next, board);
  board.forEach((row, i) => assert.notEqual(next[i], row));
});
test('apply: a White opening move uses White discs', () => {
  const next = applyMove(createInitialBoard(), 'W', { row: 2, col: 4 });
  assert.equal(next[2][4], 'W');
  assert.equal(next[3][4], 'W');
  assert.deepEqual(countDiscs(next), { black: 1, white: 4, empty: 59 });
});
test('apply: no chain captures from a newly flipped disc', () => {
  const board = emptyBoard();
  board[3][2] = 'W';
  board[3][3] = 'B';
  board[2][2] = 'W';
  board[1][2] = 'B';
  const next = applyMove(board, 'B', { row: 3, col: 1 });
  assert.equal(next[3][2], 'B');
  assert.equal(next[2][2], 'W');
});
test('apply: invalid actions leave the board unchanged', () => {
  const board = freezeDeep(createInitialBoard());
  const original = createInitialBoard();
  for (const move of [
    { row: 0, col: 0 },
    { row: 3, col: 3 },
  ]) {
    assert.throws(() => applyMove(board, 'B', move), { name: 'InvalidMoveError' });
    assert.deepEqual(board, original);
  }
});
test('counts: initial position includes empty cells', () => {
  assert.deepEqual(countDiscs(createInitialBoard()), { black: 2, white: 2, empty: 60 });
});
test('counts: empty board', () => {
  assert.deepEqual(countDiscs(emptyBoard()), { black: 0, white: 0, empty: 64 });
});
test('counts: full board', () => {
  assert.deepEqual(countDiscs(fromRows(...Array(8).fill('WWWWWWWW'))), {
    black: 0,
    white: 64,
    empty: 0,
  });
});
test('validation: malformed and out-of-range moves remain errors', () => {
  const board = createInitialBoard();
  for (const fn of [getFlips, applyMove]) {
    assert.throws(() => fn(board, 'B', { row: -1, col: 0 }), RangeError);
    assert.throws(() => fn(board, 'B', { row: 8, col: 0 }), RangeError);
    assert.throws(() => fn(board, 'B', { row: 0, col: 8 }), RangeError);
    assert.throws(() => fn(board, 'B', { row: 1.5, col: 0 }), TypeError);
    assert.throws(() => fn(board, 'B', null), TypeError);
  }
});
test('validation: invalid players and boards remain errors', () => {
  assert.throws(() => getLegalMoves(createInitialBoard(), 'X'), TypeError);
  assert.throws(() => getLegalMoves([], 'B'), TypeError);
  assert.throws(() => countDiscs([]), TypeError);
});
