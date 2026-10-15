import test from 'node:test';
import assert from 'node:assert/strict';
import { replay, runCli, scenario } from './support.js';

test('CLI applies a move, displays it, and prompts the other player', () => {
  const run = runCli('4\nscore\nquit\n');
  assert.equal(run.status, 0);
  assert.match(run.stdout, /\| \. \. \. R \. \. \. \|/);
  assert.match(run.stdout, /Player Y >/);
  assert.match(run.stdout, /R=1, Y=0, empty=41/);
  assert.doesNotMatch(run.stdout, /Not implemented/);
});

test('CLI lists the currently available columns', () => {
  const run = runCli('moves\nquit\n', ['--position', 'scenarios/full-column.json']);
  assert.equal(run.status, 0);
  assert.match(run.stdout, /Legal columns: 2, 3, 4, 5, 6, 7/);
});

test('CLI rejects a full column and lets the same player choose another', () => {
  const run = runCli('1\n2\nscore\nquit\n', ['--position', 'scenarios/full-column.json']);
  assert.equal(run.status, 0);
  assert.match(run.stdout, /Invalid move:/);
  assert.match(run.stdout, /R=4, Y=3, empty=35/);
  assert.match(run.stdout, /Player Y >/);
});

test('CLI recovers from malformed input before applying the next valid move', () => {
  const run = runCli('nonsense\n4\nquit\n');
  assert.equal(run.status, 0);
  assert.match(run.stdout, /Invalid input:/);
  assert.match(run.stdout, /\| \. \. \. R \. \. \. \|/);
  assert.match(run.stdout, /Player Y >/);
});

test('CLI announces a horizontal win and does not consume further moves', () => {
  const run = runCli('1\n7\n2\n7\n4\n6\n3\n5\nscore\n');
  assert.equal(run.status, 0);
  assert.match(run.stdout, /Winner: R/);
  assert.match(run.stdout, /R=4, Y=3, empty=35/);
  assert.doesNotMatch(run.stdout, /Draw:/);
  assert.equal((run.stdout.match(/Winner:/g) ?? []).length, 1);
});

for (const name of ['diagonal-down', 'diagonal-up']) {
  test(`CLI can replay a full game ending at ${name}`, () => {
    const record = replay(name);
    const run = runCli(record.moves.join('\n') + '\n');
    assert.equal(run.status, 0);
    assert.match(run.stdout, new RegExp(`Winner: ${record.winner}`));
    assert.doesNotMatch(run.stdout, /Not implemented|Invalid input|already|full\./);
  });
}

test('CLI resolves a last-square draw fixture', () => {
  const column = replay('final-draw').moves.at(-1);
  const run = runCli(`${column}\n`, ['--position', 'scenarios/final-draw.json']);
  assert.equal(run.status, 0);
  assert.match(run.stdout, /Draw: the board is full/);
  assert.match(run.stdout, /empty=0/);
  assert.doesNotMatch(run.stdout, /Winner:/);
});

test('CLI prioritizes a final-square win over a draw', () => {
  const column = replay('final-square-win').moves.at(-1);
  const run = runCli(`${column}\n`, ['--position', 'scenarios/final-square-win.json']);
  assert.equal(run.status, 0);
  assert.match(run.stdout, new RegExp(`Winner: ${scenario('final-square-win').player}`));
  assert.match(run.stdout, /empty=0/);
  assert.doesNotMatch(run.stdout, /Draw:/);
});

test('CLI can play all 42 turns of the supplied draw replay', () => {
  const run = runCli(replay('final-draw').moves.join('\n') + '\n');
  assert.equal(run.status, 0);
  assert.match(run.stdout, /Draw: the board is full/);
  assert.match(run.stdout, /empty=0/);
  assert.doesNotMatch(run.stdout, /Winner:|Not implemented/);
});
