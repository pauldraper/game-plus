const test = require('node:test');
const assert = require('node:assert/strict');
const { cli } = require('./cli-helper');

test('CLI gameplay: an occupied square is retried without consuming a turn', () => {
  const result = cli('A1\nA1\nB2\nquit\n');
  assert.strictEqual(result.status, 0, result.stderr);
  assert.match(result.stdout, /Invalid move: Cell occupied/);
  assert.match(result.stdout, /Player 2 > Invalid move: Cell occupied\nPlayer 2 >/);
  assert.match(result.stdout, /2 \|   \| O \|/);
  assert.match(result.stdout, /Session ended/);
});

for (const [name, moves, resultText] of [
  ['MAX win', 'A1\nA2\nB1\nB2\nC1\n', 'Player 1 wins.'],
  ['MIN win', 'A1\nA2\nB1\nB2\nC3\nC2\n', 'Player 2 wins.'],
  ['draw', 'A1\nB1\nC1\nB2\nA2\nC2\nB3\nA3\nC3\n', 'Draw.'],
]) {
  test('CLI gameplay: completes a piped ' + name + ' session', () => {
    const result = cli(moves);
    assert.strictEqual(result.status, 0, result.stderr);
    assert.ok(result.stdout.includes(resultText), result.stdout);
    assert.doesNotMatch(result.stdout, /Invalid move:|Not implemented:/);
  });
}
