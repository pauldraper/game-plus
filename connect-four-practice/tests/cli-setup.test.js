import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { MODE, runCli } from './support.js';

test('CLI help is available without entering a game', () => {
  const run = runCli('', ['--help']);
  assert.equal(run.status, 0);
  assert.match(run.stdout, /Usage:/);
  assert.doesNotMatch(run.stdout, /Player R >/);
});

test('CLI starts in the selected mode and exits on EOF', () => {
  const run = runCli('');
  assert.equal(run.status, 0);
  assert.match(run.stdout, new RegExp(MODE === 'example' ? 'EXAMPLE mode' : 'PRACTICE mode'));
  assert.match(run.stdout, /1 2 3 4 5 6 7/);
});

test('supplied shell supports help, board, score, and quit before rules are complete', () => {
  const run = runCli('HELP\nboard\nscore\nquit\n');
  assert.equal(run.status, 0);
  assert.match(run.stdout, /Drop your disc/);
  assert.match(run.stdout, /R=0, Y=0, empty=42/);
  assert.match(run.stdout, /Goodbye/);
  assert.equal(run.stderr, '');
});

test('bad command does not consume the current turn', () => {
  const run = runCli('8\n\n2x\nquit\n');
  assert.equal(run.status, 0);
  assert.equal((run.stdout.match(/Invalid input:/g) ?? []).length, 3);
  assert.doesNotMatch(run.stdout, /Player Y >/);
});

test('unknown command-line options fail without a stack trace', () => {
  const run = runCli('', ['--unknown']);
  assert.equal(run.status, 1);
  assert.match(run.stderr, /Configuration error:/);
});

test('a missing position file fails cleanly', () => {
  const run = runCli('', ['--position', 'scenarios/does-not-exist.json']);
  assert.equal(run.status, 1);
  assert.match(run.stderr, /Configuration error:/);
});

test('position files with spaces load and malformed ones are rejected', () => {
  const dir = mkdtempSync(join(tmpdir(), 'connect four '));
  try {
    const file = join(dir, 'saved position.json');
    writeFileSync(file, JSON.stringify({ rows: Array(6).fill('.......'), player: 'Y', status: 'playing', winner: null }));
    const ok = runCli('quit\n', ['--position', file]);
    assert.equal(ok.status, 0);
    assert.match(ok.stdout, /Player Y >/);
    writeFileSync(file, '{');
    const bad = runCli('', ['--position', file]);
    assert.equal(bad.status, 1);
    assert.match(bad.stderr, /Configuration error:/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
