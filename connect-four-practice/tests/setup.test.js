import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ROWS, COLS, EMPTY, assertBoard, assertColumn, assertGravity, assertPlayer,
  assertState, cloneBoard, countDiscs, createBoard, otherPlayer,
} from '../src/model.js';
import { createInitialState, getResult, parsePosition } from '../src/state.js';
import { parseArgs, parseCommand, renderBoard, renderCounts } from '../src/ui.js';

test('supplied model creates six independent seven-cell rows', () => {
  const board = createBoard();
  assert.equal(board.length, ROWS);
  assert.equal(new Set(board).size, ROWS);
  for (const row of board) assert.deepEqual(row, Array(COLS).fill(EMPTY));
  board[5][0] = 'R';
  assert.equal(board[4][0], '.');
});

test('supplied state starts R on an empty active board', () => {
  const state = createInitialState();
  assertState(state);
  assert.equal(state.player, 'R');
  assert.equal(state.status, 'playing');
  assert.equal(state.winner, null);
  assert.equal(getResult(state), null);
});

test('initial states do not share rows or board storage', () => {
  const a = createInitialState();
  const b = createInitialState();
  a.board[5][0] = 'R';
  assert.equal(b.board[5][0], '.');
});

test('supplied cloning copies every row', () => {
  const board = createBoard();
  const clone = cloneBoard(board);
  assert.notEqual(clone, board);
  for (let row = 0; row < ROWS; row += 1) assert.notEqual(clone[row], board[row]);
  clone[5][1] = 'Y';
  assert.equal(board[5][1], '.');
});

test('counts include each of the 42 cells', () => {
  const board = createBoard();
  board[5][0] = 'R'; board[5][1] = 'Y'; board[4][1] = 'R';
  assert.deepEqual(countDiscs(board), { red: 2, yellow: 1, empty: 39 });
  assert.equal(renderCounts(board), 'Discs: R=2, Y=1, empty=39.');
});

test('player helper and validation distinguish R and Y', () => {
  assert.equal(otherPlayer('R'), 'Y');
  assert.equal(otherPlayer('Y'), 'R');
  for (const bad of ['X', '.', null, 0, 'r']) assert.throws(() => assertPlayer(bad), TypeError);
});

test('column validation distinguishes types from bounds', () => {
  for (const bad of ['1', null, NaN, Infinity, 1.2, true]) assert.throws(() => assertColumn(bad), TypeError);
  for (const bad of [-1, 7, 100]) assert.throws(() => assertColumn(bad), RangeError);
  assertColumn(0); assertColumn(6);
});

test('board validation rejects wrong shape, symbols, and sparse arrays', () => {
  for (const bad of [null, [], Array(6), '.......']) assert.throws(() => assertBoard(bad), TypeError);
  const badRow = createBoard(); badRow[2] = Array(7);
  assert.throws(() => assertBoard(badRow), TypeError);
  const badCell = createBoard(); badCell[5][1] = 'X';
  assert.throws(() => assertBoard(badCell), TypeError);
  const wrongWidth = createBoard(); wrongWidth[1].push('.');
  assert.throws(() => assertBoard(wrongWidth), TypeError);
});

test('state validation enforces metadata structure', () => {
  for (const patch of [{ player: 'X' }, { status: 'paused' }, { winner: 'X' }, { winner: 'R' }]) {
    assert.throws(() => assertState({ ...createInitialState(), ...patch }), TypeError);
  }
  assert.throws(() => assertState(null), TypeError);
});

test('gravity validation rejects gaps beneath discs', () => {
  const board = createBoard();
  assertGravity(board);
  board[4][2] = 'R';
  assert.throws(() => assertGravity(board), /floating/);
  board[5][2] = 'Y';
  assertGravity(board);
});

test('terminal parser accepts exactly columns 1 through 7', () => {
  for (let col = 1; col <= 7; col += 1) {
    assert.deepEqual(parseCommand(` ${col}\r\n`), { type: 'drop', column: col - 1 });
  }
});

test('terminal parser accepts case-insensitive supplied commands', () => {
  for (const type of ['help', 'moves', 'board', 'score', 'quit']) {
    assert.deepEqual(parseCommand(` ${type.toUpperCase()} `), { type });
  }
});

test('terminal parser rejects blank, malformed, and out-of-range input', () => {
  for (const bad of ['', ' ', '0', '8', '-1', '1.0', '02', '4x', 'A1', 'drop 4', '1 2', null]) {
    assert.throws(() => parseCommand(bad), TypeError);
  }
});

test('board rendering displays coordinates and all six rows', () => {
  const board = createBoard(); board[5][3] = 'R';
  const view = renderBoard(board);
  assert.match(view, /1 2 3 4 5 6 7/);
  assert.equal(view.split('\n').filter(line => line.startsWith('|')).length, 6);
  assert.match(view, /\| \. \. \. R \. \. \. \|/);
});

test('argument parser explicitly selects example and positions', () => {
  assert.deepEqual(parseArgs([]), { example: false, position: null, help: false });
  assert.deepEqual(parseArgs(['--example', '--position', 'a b.json']), {
    example: true, position: 'a b.json', help: false,
  });
  assert.equal(parseArgs(['--help']).help, true);
});

test('argument parser rejects duplicates, unknown flags, and missing paths', () => {
  for (const args of [['--example', '--example'], ['--position'], ['--position', '--example'], ['--oops']]) {
    assert.throws(() => parseArgs(args), TypeError);
  }
});

test('position loader converts row strings to validated arrays', () => {
  const rows = Array(6).fill('.......'); rows[5] = '...R...';
  const state = parsePosition(JSON.stringify({ rows, player: 'Y', status: 'playing', winner: null }));
  assert.equal(state.board[5][3], 'R');
  assert.equal(state.player, 'Y');
  assert.equal(new Set(state.board).size, 6);
});

test('position loader rejects malformed JSON, schema, and floating discs', () => {
  assert.throws(() => parsePosition('{'), SyntaxError);
  for (const data of [null, { rows: [1, 2] }, { rows: ['.......'] }]) {
    assert.throws(() => parsePosition(JSON.stringify(data)), TypeError);
  }
  const rows = Array(6).fill('.......'); rows[0] = 'R......';
  assert.throws(() => parsePosition(JSON.stringify({ rows, player: 'Y', status: 'playing', winner: null })), /floating/);
});

test('result helper uses terminal metadata and includes counts', () => {
  const state = createInitialState();
  state.board[5] = [...'RRRR...']; state.status = 'finished'; state.winner = 'R';
  assert.deepEqual(getResult(state), { winner: 'R', draw: false, red: 4, yellow: 0, empty: 38 });
});
