import test from 'node:test';
import assert from 'node:assert/strict';
import { InvalidMoveError, createBoard, countDiscs } from '../src/model.js';
import { boardOf, completedFixture, freezeBoard, rules, scenario } from './support.js';
const { getDropRow, getLegalColumns, getWinner, isDraw, dropDisc } = rules;

test('placement query returns the bottom row on an empty board', () => {
  for (let col = 0; col < 7; col += 1) assert.equal(getDropRow(createBoard(), col), 5);
});

test('placement query locates the next slot above existing discs', () => {
  const board = createBoard(); board[5][3] = 'R'; board[4][3] = 'Y';
  assert.equal(getDropRow(board, 3), 3);
});

test('placement query returns -1 for a full column', () => {
  assert.equal(getDropRow(scenario('full-column').board, 0), -1);
});

test('legal columns initially include all seven in ascending order', () => {
  assert.deepEqual(getLegalColumns(createBoard()), [0, 1, 2, 3, 4, 5, 6]);
});

test('legal columns exclude full columns', () => {
  assert.deepEqual(getLegalColumns(scenario('full-column').board), [1, 2, 3, 4, 5, 6]);
});

test('winning and full-draw boards expose no legal moves', () => {
  const won = createBoard(); won[5] = [...'RRRR...'];
  assert.deepEqual(getLegalColumns(won), []);
  assert.deepEqual(getLegalColumns(completedFixture('final-draw')), []);
});

test('empty board has no winner and is not a draw', () => {
  assert.equal(getWinner(createBoard()), null);
  assert.equal(isDraw(createBoard()), false);
});

for (const player of ['R', 'Y']) {
  for (const [name, cells] of [
    ['horizontal', [[5, 0], [5, 1], [5, 2], [5, 3]]],
    ['vertical', [[2, 6], [3, 6], [4, 6], [5, 6]]],
    ['descending diagonal', [[0, 0], [1, 1], [2, 2], [3, 3]]],
    ['ascending diagonal', [[5, 0], [4, 1], [3, 2], [2, 3]]],
  ]) {
    test(`winner detection recognizes ${player} on a ${name}`, () => {
      const board = createBoard();
      for (const [row, col] of cells) board[row][col] = player;
      assert.equal(getWinner(board), player);
    });
  }
}

test('three matching discs are not a win', () => {
  const board = createBoard(); board[5] = [...'RRR....'];
  assert.equal(getWinner(board), null);
});

test('disconnected and opponent-interrupted discs are not a win', () => {
  for (const line of ['RR.RR..', 'RRYRR..', 'RYRYRYR']) {
    const board = createBoard(); board[5] = [...line];
    assert.equal(getWinner(board), null);
  }
});

test('flat-array adjacency must not wrap from one row to the next', () => {
  const board = createBoard();
  for (const [row, col] of [[4, 5], [4, 6], [5, 0], [5, 1]]) board[row][col] = 'R';
  assert.equal(getWinner(board), null);
});

test('a diagonal must not wrap across the left or right edge', () => {
  for (const cells of [
    [[2, 5], [3, 6], [4, 0], [5, 1]],
    [[2, 1], [3, 0], [4, 6], [5, 5]],
  ]) {
    const board = createBoard();
    for (const [row, col] of cells) board[row][col] = 'Y';
    assert.equal(getWinner(board), null);
  }
});

test('more than four contiguous discs still constitutes a win', () => {
  for (const line of ['.RRRRR.', 'YYYYYY.']) {
    const board = createBoard(); board[5] = [...line];
    assert.equal(getWinner(board), line.includes('R') ? 'R' : 'Y');
  }
});

test('winner detection finds a line that starts away from a board edge', () => {
  const board = createBoard(); board[3] = [...'.YYYY..'];
  assert.equal(getWinner(board), 'Y');
});

test('draw requires a full board with no winner', () => {
  assert.equal(isDraw(scenario('final-draw').board), false);
  assert.equal(isDraw(completedFixture('final-draw')), true);
});

test('a winning last-square move takes priority over a full-board draw', () => {
  const board = completedFixture('final-square-win');
  assert.notEqual(getWinner(board), null);
  assert.equal(isDraw(board), false);
});

test('drop creates one disc at the bottom without mutating input', () => {
  const board = freezeBoard(createBoard());
  const next = dropDisc(board, 'R', 3);
  assert.equal(next[5][3], 'R');
  assert.deepEqual(countDiscs(next), { red: 1, yellow: 0, empty: 41 });
  assert.equal(board[5][3], '.');
  assert.notEqual(next, board);
  for (let row = 0; row < 6; row += 1) assert.notEqual(next[row], board[row]);
});

test('successive drops stack upwards in the same column', () => {
  const a = dropDisc(createBoard(), 'R', 4);
  const b = dropDisc(a, 'Y', 4);
  assert.equal(b[5][4], 'R');
  assert.equal(b[4][4], 'Y');
  assert.equal(a[4][4], '.');
});

test('drop rejects full columns without changing the board', () => {
  const board = freezeBoard(scenario('full-column').board);
  assert.throws(() => dropDisc(board, 'R', 0), InvalidMoveError);
});

test('drop rejects a board that already has a winner', () => {
  const board = createBoard(); board[5] = [...'YYYY...'];
  assert.throws(() => dropDisc(board, 'R', 6), InvalidMoveError);
});

test('queries can inspect deeply frozen input without changing it', () => {
  const board = freezeBoard(scenario('full-column').board);
  const before = JSON.stringify(board);
  getDropRow(board, 1); getLegalColumns(board); getWinner(board); isDraw(board);
  assert.equal(JSON.stringify(board), before);
});

test('public rule functions retain supplied malformed-argument checks', () => {
  const board = createBoard();
  for (const fn of [getLegalColumns, getWinner, isDraw]) assert.throws(() => fn(null), TypeError);
  assert.throws(() => getDropRow(board, 7), RangeError);
  assert.throws(() => getDropRow(board, '1'), TypeError);
  assert.throws(() => dropDisc(board, 'X', 0), TypeError);
  assert.throws(() => dropDisc(board, 'R', -1), RangeError);
});
