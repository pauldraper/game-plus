import test from 'node:test';
import assert from 'node:assert/strict';
import { countDiscs, InvalidMoveError } from '../src/model.js';
import { createInitialState, getResult } from '../src/state.js';
import { freezeBoard, playMove, replay, rules, scenario } from './support.js';

test('a legal first move advances from R to Y', () => {
  const initial = createInitialState();
  const next = playMove(initial, 3);
  assert.equal(next.player, 'Y');
  assert.equal(next.board[5][3], 'R');
  assert.equal(next.status, 'playing');
  assert.equal(next.winner, null);
  assert.equal(getResult(next), null);
});

test('turns alternate after successful moves only', () => {
  let state = createInitialState();
  for (const column of [0, 1, 2]) state = playMove(state, column);
  assert.equal(state.player, 'Y');
  assert.deepEqual(state.board[5], [...'RYR....']);
});

test('a move returns independent state and board snapshots', () => {
  const state = createInitialState();
  freezeBoard(state.board); Object.freeze(state);
  const next = playMove(state, 6);
  assert.notEqual(next, state);
  assert.notEqual(next.board, state.board);
  for (let row = 0; row < 6; row += 1) assert.notEqual(next.board[row], state.board[row]);
  assert.deepEqual(countDiscs(state.board), { red: 0, yellow: 0, empty: 42 });
});

test('full-column rejection neither changes state nor consumes the turn', () => {
  const state = scenario('full-column');
  const before = JSON.stringify(state);
  assert.throws(() => playMove(state, 0), InvalidMoveError);
  assert.equal(JSON.stringify(state), before);
  const next = playMove(state, 1);
  assert.equal(next.board[5][1], 'R');
  assert.equal(next.player, 'Y');
});

test('winning move can connect both sides of a line', () => {
  const state = playMove(scenario('near-horizontal-win'), 2);
  assert.equal(state.status, 'finished');
  assert.equal(state.winner, 'R');
  assert.equal(state.player, 'R');
  assert.equal(getResult(state).draw, false);
  assert.deepEqual(rules.getLegalColumns(state.board), []);
});

test('vertical win ends a normally played game immediately', () => {
  let state = createInitialState();
  for (const column of [0, 1, 0, 1, 0, 1, 0]) state = playMove(state, column);
  assert.equal(state.status, 'finished');
  assert.equal(state.winner, 'R');
  assert.equal(state.player, 'R');
});

for (const name of ['diagonal-down', 'diagonal-up']) {
  test(`${name} replay reaches its first win on the final move`, () => {
    const record = replay(name);
    let state = createInitialState();
    for (const column of record.moves) {
      assert.equal(state.status, 'playing');
      state = playMove(state, column - 1);
    }
    assert.equal(state.status, 'finished');
    assert.equal(state.winner, record.winner);
  });
}

test('a full-board draw finishes with no winner and retains the last actor', () => {
  const before = scenario('final-draw');
  const column = replay('final-draw').moves.at(-1) - 1;
  const state = playMove(before, column);
  assert.equal(state.status, 'finished');
  assert.equal(state.player, before.player);
  assert.equal(state.winner, null);
  const result = getResult(state);
  assert.equal(result.draw, true);
  assert.equal(result.empty, 0);
});

test('a last-square win finishes as a win, not a draw', () => {
  const before = scenario('final-square-win');
  const column = replay('final-square-win').moves.at(-1) - 1;
  const state = playMove(before, column);
  assert.equal(state.status, 'finished');
  assert.equal(state.winner, before.player);
  assert.equal(state.player, before.player);
  assert.equal(getResult(state).draw, false);
  assert.equal(getResult(state).empty, 0);
});

test('the 42-move draw replay remains active until the board is full', () => {
  let state = createInitialState();
  for (const column of replay('final-draw').moves) {
    assert.equal(state.status, 'playing');
    state = playMove(state, column - 1);
  }
  assert.equal(state.status, 'finished');
  assert.equal(state.winner, null);
  assert.equal(getResult(state).empty, 0);
});

test('finished states reject additional moves', () => {
  const state = scenario('near-horizontal-win');
  state.status = 'finished'; state.winner = 'R';
  // This deliberately synthetic state isolates the terminal-state guard.
  const before = JSON.stringify(state);
  assert.throws(() => playMove(state, 6), InvalidMoveError);
  assert.equal(JSON.stringify(state), before);
});

test('lifecycle retains supplied malformed-argument checks', () => {
  assert.throws(() => playMove(null, 0), TypeError);
  assert.throws(() => playMove(createInitialState(), '1'), TypeError);
  assert.throws(() => playMove(createInitialState(), 7), RangeError);
});
