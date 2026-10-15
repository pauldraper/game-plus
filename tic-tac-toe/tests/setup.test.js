const test = require('node:test');
const assert = require('node:assert/strict');
const {
  game: { initialState, interactiveGame },
  utils,
  Player,
} = require('./implementation');

test('setup: an empty board has independent rows and starts with MAX', () => {
  const state = initialState();
  assert.deepEqual(
    state,
    Array.from({ length: 3 }, () => [null, null, null]),
  );
  state[0][0] = Player.MAX;
  assert.strictEqual(state[1][0], null);
  assert.strictEqual(initialState()[0][0], null);
  assert.strictEqual(interactiveGame.initial().player, Player.MAX);
});

test('setup: console coordinates round-trip and malformed input is rejected', () => {
  assert.deepEqual(interactiveGame.parseMove(' B3\n'), [2, 1]);
  assert.strictEqual(interactiveGame.serializeMove([2, 1]), 'B3');
  for (const input of ['A', 'D1', 'A0', 'A4', 'a1']) {
    assert.throws(() => interactiveGame.parseMove(input));
  }
});

test('setup: rendering uses player symbols and board labels', () => {
  const state = initialState();
  state[0][0] = Player.MAX;
  state[1][1] = Player.MIN;
  const output = interactiveGame.print(state);
  assert.match(output, /A   B   C/);
  assert.match(output, /1 \| X \|/);
  assert.match(output, /2 \|   \| O \|/);
  assert.strictEqual(utils.countOccupiedCells(state), 2);
});
