import test from 'node:test';
import assert from 'node:assert/strict';
import { cli } from './cli-helper.js';

test('CLI gameplay: opening moves and score are displayed', () => {
  const result = cli('moves\nscore\nquit\n');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /D3, C4, F5, E6/);
  assert.match(result.stdout, /B 2, W 2, empty 60/);
  assert.doesNotMatch(result.stdout, /Not implemented/);
});
test('CLI gameplay: a legal move changes the turn and score', () => {
  const result = cli('d3\nscore\nquit\n');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Turn: W/);
  assert.match(result.stdout, /B 4, W 1, empty 59/);
});
test('CLI gameplay: repeated occupied move leaves the position unchanged', () => {
  const result = cli('d3\nd3\nscore\nquit\n');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Invalid move:/);
  assert.match(result.stdout, /B 4, W 1, empty 59/);
});
test('CLI gameplay: illegal pass does not prevent a subsequent valid move', () => {
  const result = cli('pass\nd3\nquit\n');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Invalid move:/);
  assert.match(result.stdout, /Turn: W/);
});
test('CLI gameplay: forced pass then final move announces the result', () => {
  const result = cli('pass\na1\n', ['--position', 'scenarios/forced-pass.json']);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Turn: W/);
  assert.match(result.stdout, /Final score: B 61, W 3, empty 0/);
  assert.match(result.stdout, /B wins/);
});
test('CLI gameplay: neither player has a move, with space still on the board', () => {
  const result = cli('pass\n', ['--position', 'scenarios/both-blocked.json']);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Final score: B 63, W 0, empty 1/);
  assert.match(result.stdout, /B wins/);
});
test('CLI gameplay: a final draw is announced', () => {
  const result = cli('a1\n', ['--position', 'scenarios/final-draw.json']);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Final score: B 32, W 32, empty 0/);
  assert.match(result.stdout, /Draw/);
});
