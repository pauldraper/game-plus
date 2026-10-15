const test = require('node:test');
const assert = require('node:assert/strict');
const {
  Player: { MAX, MIN },
  game: { game, initialState },
  InvalidMoveError,
} = require('./implementation');

test('outcome: active, drawn, and won positions are distinct from evaluation', () => {
  assert.strictEqual(game.outcome(initialState()), 'playing');
  assert.strictEqual(
    game.outcome([
      [MAX, MIN, MAX],
      [MAX, MIN, MIN],
      [MIN, MAX, MAX],
    ]),
    'draw',
  );
  assert.strictEqual(
    game.outcome([
      [MIN, MIN, MIN],
      [MAX, MAX, null],
      [MAX, null, null],
    ]),
    MIN,
  );
});

test('move: a won or drawn game rejects further marks', () => {
  const won = [
    [MAX, MAX, MAX],
    [MIN, MIN, null],
    [null, null, null],
  ];
  const draw = [
    [MAX, MIN, MAX],
    [MAX, MIN, MIN],
    [MIN, MAX, MAX],
  ];
  for (const state of [won, draw]) {
    const before = JSON.stringify(state);
    assert.throws(() => game.move(state, [2, 2], MIN), InvalidMoveError);
    assert.strictEqual(JSON.stringify(state), before);
  }
});

test('score: realistic wins favor fewer occupied cells for both players', () => {
  const maxEarly = [
    [MAX, MAX, MAX],
    [MIN, MIN, null],
    [null, null, null],
  ];
  const maxLate = [
    [MAX, MAX, MAX],
    [MIN, MIN, MAX],
    [MIN, null, null],
  ];
  const minEarly = [
    [MAX, MAX, null],
    [MIN, MIN, MIN],
    [MAX, null, null],
  ];
  const minLate = [
    [MAX, MAX, MIN],
    [MIN, MIN, MIN],
    [MAX, null, MAX],
  ];
  assert.strictEqual(game.score(maxEarly), 1 / 5);
  assert.strictEqual(game.score(maxLate), 1 / 7);
  assert.strictEqual(game.score(minEarly), -1 / 6);
  assert.strictEqual(game.score(minLate), -1 / 8);
  assert.ok(game.score(maxEarly) > game.score(maxLate));
  assert.ok(game.score(minEarly) < game.score(minLate));
});

test('queries: frozen inputs stay intact and returned move arrays are independent', () => {
  const state = initialState();
  state.forEach(Object.freeze);
  Object.freeze(state);
  game.outcome(state);
  game.score(state);
  const first = game.moves(state, MAX);
  first[0][0] = 99;
  first.pop();
  const second = game.moves(state, MAX);
  assert.strictEqual(second.length, 9);
  assert.deepEqual(second[0], [0, 0]);
  assert.strictEqual(state[0][0], null);
});
