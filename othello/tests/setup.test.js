import {
  createInitialBoard,
  cloneBoard,
  assertBoard,
  assertMove,
  assertPlayer,
  assertState,
  otherPlayer,
  createGame,
  getResult,
  parseMove,
  formatMove,
  parseCommand,
  renderBoard,
} from './implementation.js';
import test from 'node:test';
import assert from 'node:assert/strict';

test('setup: opening board has the specified orientation', () => {
  const board = createInitialBoard();
  assert.equal(board.length, 8);
  assert.ok(board.every((row) => row.length === 8));
  assert.equal(board[3][3], 'W');
  assert.equal(board[3][4], 'B');
  assert.equal(board[4][3], 'B');
  assert.equal(board[4][4], 'W');
  assert.equal(board.flat().filter((cell) => cell === '.').length, 60);
});
test('setup: board rows do not share storage', () => {
  const board = createInitialBoard();
  board[0][0] = 'B';
  assert.equal(board[1][0], '.');
  assert.equal(createInitialBoard()[0][0], '.');
});
test('setup: cloning produces independent rows', () => {
  const original = createInitialBoard();
  const copy = cloneBoard(original);
  assert.deepEqual(copy, original);
  copy[3][3] = 'B';
  assert.equal(original[3][3], 'W');
  original.forEach((row, i) => assert.notEqual(row, copy[i]));
});
test('setup: a game starts on Black with no final result', () => {
  const state = createGame();
  assert.equal(state.player, 'B');
  assert.equal(state.status, 'playing');
  assert.equal(getResult(state), null);
});
test('setup: player switching rejects unknown symbols', () => {
  assert.equal(otherPlayer('B'), 'W');
  assert.equal(otherPlayer('W'), 'B');
  assert.throws(() => assertPlayer('X'), TypeError);
});
test('setup: board validation rejects malformed and sparse arrays', () => {
  assert.throws(() => assertBoard([]), TypeError);
  const bad = createInitialBoard();
  bad[0][0] = 'X';
  assert.throws(() => assertBoard(bad), TypeError);
  const sparse = createInitialBoard();
  delete sparse[0][0];
  assert.throws(() => assertBoard(sparse), TypeError);
});
test('setup: coordinate validation rejects fractional and out-of-range values', () => {
  assert.throws(() => assertMove({ row: -1, col: 0 }), RangeError);
  assert.throws(() => assertMove({ row: 0.5, col: 0 }), TypeError);
  assert.throws(() => assertMove(null), TypeError);
});
test('setup: game-state validation rejects unknown status', () => {
  assert.throws(() => assertState({ ...createGame(), status: 'maybe' }), TypeError);
});
test('setup: parser supports case and outer whitespace', () => {
  assert.deepEqual(parseMove('  d3  '), { row: 2, col: 3 });
  assert.deepEqual(parseMove('H8'), { row: 7, col: 7 });
});
test('setup: parser rejects incomplete, extra, and invalid input', () => {
  for (const text of ['', 'A', 'A0', 'A9', 'I1', 'A10', 'D 3', 'D3extra']) {
    assert.throws(() => parseMove(text), { name: 'InvalidMoveError' });
  }
});
test('setup: all 64 coordinate labels round-trip', () => {
  for (let row = 0; row < 8; row++)
    for (let col = 0; col < 8; col++) {
      assert.deepEqual(parseMove(formatMove({ row, col })), { row, col });
    }
});
test('setup: commands and coordinates are distinct', () => {
  assert.deepEqual(parseCommand(' PASS '), { kind: 'pass' });
  assert.deepEqual(parseCommand(''), { kind: 'empty' });
  assert.deepEqual(parseCommand('d3'), { kind: 'move', move: { row: 2, col: 3 } });
});
test('setup: renderer includes axes and the initial discs', () => {
  const text = renderBoard(createInitialBoard());
  assert.match(text, /A B C D E F G H/);
  assert.match(text, /4  \. \. \. W B \. \. \./);
  assert.equal(text.split('\n').length, 9);
});
