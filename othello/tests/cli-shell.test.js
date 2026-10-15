import test from 'node:test';
import assert from 'node:assert/strict';
import { cli } from './cli-helper.js';

test('CLI setup: help option works without game rules', () => {
  const result = cli('', ['--help']);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Usage:/);
});
test('CLI setup: open, show help, and quit', () => {
  const result = cli('help\nquit\n');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Turn: B/);
  assert.match(result.stdout, /Commands:/);
  assert.match(result.stdout, /Session ended/);
});
test('CLI setup: board can be shown without game rules', () => {
  const result = cli('board\nquit\n');
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.match(/A B C D E F G H/g).length, 2);
});
test('CLI setup: bad input reports a useful message and keeps the session alive', () => {
  const result = cli('J9\nhelp\nquit\n');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Invalid move:/);
  assert.match(result.stdout, /Commands:/);
});
test('CLI setup: blank input and end-of-input exit cleanly', () => {
  const result = cli('\n');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /end of input/);
});
test('CLI setup: unsupported arguments fail explicitly', () => {
  const result = cli('', ['--unknown']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Usage:/);
});
test('CLI setup: missing fixture file fails explicitly', () => {
  const result = cli('', ['--position', 'scenarios/missing.json']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Error:/);
});
test('CLI setup: a supplied position renders before rule implementation', () => {
  const result = cli('quit\n', ['--position', 'scenarios/forced-pass.json']);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /1  \. B W B B B B B/);
});
