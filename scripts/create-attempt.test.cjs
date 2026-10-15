const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const generator = path.join(__dirname, 'create-attempt.cjs');

for (const game of require('./challenges.cjs')) {
  test('fresh attempt: ' + game + ' contains pinned stubs and preserves earlier attempts', () => {
    const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'game-plus-attempt-test-'));
    try {
      const args = [generator, game, 'session-1', '--output', temporary];
      const result = spawnSync(process.execPath, args, { encoding: 'utf8' });
      assert.strictEqual(result.status, 0, result.stderr);
      const attempt = path.join(temporary, 'session-1');
      for (const excluded of ['example', 'node_modules', 'lib', 'starter']) {
        assert.strictEqual(fs.existsSync(path.join(attempt, excluded)), false);
      }
      const starterFiles = fs.readdirSync(path.join(root, game, 'starter', 'src'), {
        withFileTypes: true,
      });
      // Python may create cache directories beside the pinned source files.
      for (const entry of starterFiles.filter((entry) => entry.isFile())) {
        const file = entry.name;
        assert.strictEqual(
          fs.readFileSync(path.join(attempt, 'src', file), 'utf8'),
          fs.readFileSync(path.join(root, game, 'starter', 'src', file), 'utf8'),
        );
      }
      const manifest = JSON.parse(fs.readFileSync(path.join(attempt, 'package.json'), 'utf8'));
      assert.ok(
        !Object.keys(manifest.scripts).some(
          (key) => key.includes('example') || key === 'practice:new',
        ),
      );
      assert.ok(fs.existsSync(path.join(attempt, 'docs', 'CHALLENGE.md')));
      fs.writeFileSync(path.join(attempt, 'progress.txt'), 'candidate work');
      const second = spawnSync(process.execPath, args, { encoding: 'utf8' });
      assert.strictEqual(second.status, 1);
      assert.match(second.stderr, /already exists/);
      assert.strictEqual(
        fs.readFileSync(path.join(attempt, 'progress.txt'), 'utf8'),
        'candidate work',
      );
      // The generated attempt is dependency-free. Link existing packages only
      // inside this temporary test directory to simulate installation offline.
      if (game === 'tic-tac-toe') {
        fs.symlinkSync(
          path.join(root, game, 'node_modules'),
          path.join(attempt, 'node_modules'),
          'dir',
        );
      }
      const python = game === 'othello-python';
      const setup = spawnSync(
        process.execPath,
        python
          ? [path.join(attempt, 'scripts', 'run.cjs'), 'test:setup']
          : [path.join(attempt, 'scripts', 'test.cjs'), 'starter', 'setup'],
        {
          encoding: 'utf8',
          env: { ...process.env, NODE_PATH: path.join(root, 'tic-tac-toe', 'node_modules') },
        },
      );
      assert.strictEqual(setup.status, 0, setup.stdout + setup.stderr);
      assert.match(setup.stdout, /Testing starter:/);
    } finally {
      // Only this test's newly created temporary directory is removed.
      fs.rmSync(temporary, { recursive: true, force: true });
    }
  });
}

test('fresh attempt: unsafe names and unknown games are rejected', () => {
  for (const args of [['unknown'], ['othello', '../overwrite']]) {
    const result = spawnSync(process.execPath, [generator, ...args], { encoding: 'utf8' });
    assert.strictEqual(result.status, 2);
  }
});

test('fresh attempt: --output works without a name and before a supplied name', () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'game-plus-output-test-'));
  try {
    const unnamed = spawnSync(process.execPath, [generator, 'othello', '--output', temporary], {
      encoding: 'utf8',
    });
    assert.strictEqual(unnamed.status, 0, unnamed.stderr);
    const [generatedName] = fs.readdirSync(temporary);
    assert.match(generatedName, /^othello-/);
    assert.ok(fs.existsSync(path.join(temporary, generatedName, 'package.json')));
    const named = spawnSync(
      process.execPath,
      [generator, 'othello', '--output', temporary, 'named-session'],
      { encoding: 'utf8' },
    );
    assert.strictEqual(named.status, 0, named.stderr);
    assert.ok(fs.existsSync(path.join(temporary, 'named-session', 'package.json')));
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});

test('fresh attempt: malformed options fail before creating any attempts', () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'game-plus-options-test-'));
  try {
    for (const args of [
      ['--output'],
      ['--output', ''],
      ['--output', '--unknown'],
      ['--output', temporary, '--output', temporary],
      ['--output', temporary, 'first', 'second'],
      ['--output', temporary, '--unknown'],
      ['--output', temporary, ''],
    ]) {
      const result = spawnSync(process.execPath, [generator, 'othello', ...args], {
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 2, result.stderr);
    }
    assert.deepEqual(fs.readdirSync(temporary), []);
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});
