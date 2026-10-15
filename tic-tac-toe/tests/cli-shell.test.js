const test = require('node:test');
const assert = require('node:assert/strict');
const { Readable, Writable } = require('node:stream');
const { cli } = require('./cli-helper');
const {
  runCli,
  ConsoleActor,
  NotImplementedError,
  game: { interactiveGame },
} = require('./implementation');

test('CLI setup: starts, renders, accepts commands, and exits without completed rules', () => {
  const result = cli('help\nboard\nquit\n');
  assert.strictEqual(result.status, 0, result.stderr);
  assert.match(result.stdout, /A   B   C/);
  assert.match(result.stdout, /Commands:/);
  assert.match(result.stdout, /Session ended/);
  assert.doesNotMatch(result.stdout, /Not implemented/);
});

test('CLI setup: malformed input, multiple lines, blank lines, and EOF are handled', () => {
  const result = cli('\nA\nD1\nhelp\n');
  assert.strictEqual(result.status, 0, result.stderr);
  assert.match(result.stdout, /Invalid move:/);
  assert.match(result.stdout, /Session ended \(end of input\)/);
});

test('CLI setup: incomplete actions report a typed stub error and keep the shell alive', async () => {
  let output = '';
  const destination = new Writable({
    write(chunk, encoding, done) {
      output += chunk;
      done();
    },
  });
  const fake = {
    ...interactiveGame,
    game: {
      ...interactiveGame.game,
      move() {
        throw new NotImplementedError('move');
      },
      moves() {
        throw new NotImplementedError('moves');
      },
      score() {
        throw new NotImplementedError('score');
      },
    },
  };
  const state = await runCli({
    input: Readable.from(['A1\nmoves\nscore\nhelp\nquit\n']),
    output: destination,
    game: fake,
  });
  assert.match(output, /Not implemented: move/);
  assert.match(output, /Not implemented: moves/);
  assert.match(output, /Not implemented: score/);
  assert.match(output, /Session ended/);
  assert.strictEqual(state[0][0], null);
});

test('CLI setup: unexpected programming errors are not disguised as invalid input', async () => {
  const failure = new Error('programming defect');
  const fake = {
    ...interactiveGame,
    game: {
      ...interactiveGame.game,
      move() {
        throw failure;
      },
    },
  };
  await assert.rejects(
    runCli({
      input: Readable.from(['A1\n']),
      output: new Writable({
        write(chunk, encoding, done) {
          done();
        },
      }),
      game: fake,
    }),
    (error) => error === failure,
  );
});

test('console actor: reads piped lines separately and returns null at EOF', async () => {
  const actor = new ConsoleActor(
    interactiveGame,
    Readable.from(['A1\nB2\n']),
    new Writable({
      write(chunk, encoding, done) {
        done();
      },
    }),
  );
  try {
    assert.deepEqual(await actor.nextMove([], 0), [0, 0]);
    assert.deepEqual(await actor.nextMove([], 1), [1, 1]);
    assert.strictEqual(await actor.nextMove([], 0), null);
  } finally {
    actor.close();
  }
});

test('CLI setup: completion uses outcome even when score is unavailable', async () => {
  let output = '';
  const fake = {
    ...interactiveGame,
    game: {
      ...interactiveGame.game,
      move(state) {
        return state;
      },
      outcome() {
        return 0;
      }, // Player.MAX is numeric zero, not a falsy "no winner".
      score() {
        throw new Error('The CLI must not use evaluation to detect a winner');
      },
    },
  };
  await runCli({
    input: Readable.from(['A1\n']),
    output: new Writable({
      write(chunk, encoding, done) {
        output += chunk;
        done();
      },
    }),
    game: fake,
  });
  assert.match(output, /Player 1 wins/);
});
