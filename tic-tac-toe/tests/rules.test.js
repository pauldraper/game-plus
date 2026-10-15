const test = require('node:test');
const assert = require('node:assert/strict');
const {
  game: { game, initialState },
  utils,
  Player,
  Minimax,
} = require('./implementation');
const { MAX, MIN } = Player;

test('move: a new mark does not change the original board or share rows', () => {
  const original = initialState();
  original.forEach(Object.freeze);
  Object.freeze(original);
  const updated = game.move(original, [1, 2], MIN);
  assert.strictEqual(updated[1][2], MIN);
  assert.strictEqual(original[1][2], null);
  assert.notStrictEqual(updated, original);
  updated.forEach((row, index) => assert.notStrictEqual(row, original[index]));
  assert.strictEqual(utils.countOccupiedCells(updated), 1);
});

test('move: out-of-bounds and occupied moves throw without changing the board', () => {
  const state = initialState();
  state[0][0] = MAX;
  const before = JSON.stringify(state);
  for (const move of [
    [-1, 0],
    [3, 0],
    [0, -1],
    [0, 3],
    [0.5, 0],
    [0, Infinity],
  ]) {
    assert.throws(() => game.move(state, move, MIN), /bounds/);
  }
  assert.throws(() => game.move(state, [0, 0], MIN), /occupied/i);
  assert.strictEqual(JSON.stringify(state), before);
});

test('moves: either player gets only empty cells in row-major order', () => {
  const state = [
    [MAX, MIN, null],
    [null, MAX, null],
    [MIN, null, null],
  ];
  const before = JSON.stringify(state);
  const expected = [
    [0, 2],
    [1, 0],
    [1, 2],
    [2, 1],
    [2, 2],
  ];
  assert.deepEqual(game.moves(state, MAX), expected);
  assert.deepEqual(game.moves(state, MIN), expected);
  assert.strictEqual(JSON.stringify(state), before);
});

// Explicit fixtures check every winning direction independently of the generator.
const winningBoards = [
  ['XXX', '...', '...'],
  ['...', 'XXX', '...'],
  ['...', '...', 'XXX'],
  ['X..', 'X..', 'X..'],
  ['.X.', '.X.', '.X.'],
  ['..X', '..X', '..X'],
  ['X..', '.X.', '..X'],
  ['..X', '.X.', 'X..'],
];
for (const [index, fixture] of winningBoards.entries()) {
  for (const player of [MAX, MIN]) {
    test(`winner and score: line ${index + 1}, player ${player}`, () => {
      const state = fixture.map((row) => [...row].map((cell) => (cell === 'X' ? player : null)));
      assert.strictEqual(utils.getWinner(state, utils.createWinningLines(3)), player);
      assert.strictEqual(game.score(state), player === MAX ? 1 / 3 : -1 / 3);
      assert.deepEqual(game.moves(state, MAX), []);
      assert.deepEqual(game.moves(state, MIN), []);
    });
  }
}

test('winner: incomplete and mixed lines are not wins', () => {
  const state = [
    [MAX, MIN, MAX],
    [null, MIN, null],
    [null, null, null],
  ];
  assert.strictEqual(utils.getWinner(state, utils.createWinningLines(3)), null);
  assert.strictEqual(game.score(state), 0);
});

test('winner: generated lines work on a larger board', () => {
  const state = utils.createBoard(4);
  state[0][3] = state[1][2] = state[2][1] = state[3][0] = MIN;
  assert.strictEqual(utils.getWinner(state, utils.createWinningLines(4)), MIN);
});

test('completion: a full-board draw has no winner or further moves', () => {
  const state = [
    [MAX, MIN, MAX],
    [MAX, MIN, MIN],
    [MIN, MAX, MAX],
  ];
  assert.strictEqual(utils.getWinner(state, utils.createWinningLines(3)), null);
  assert.strictEqual(game.score(state), 0);
  assert.deepEqual(game.moves(state, MAX), []);
});

test('completion: a win on the final square is distinct from a draw', () => {
  const state = [
    [MAX, MIN, MAX],
    [MIN, MAX, MIN],
    [MIN, MAX, null],
  ];
  const completed = game.move(state, [2, 2], MAX);
  assert.strictEqual(game.score(completed), 1 / 9);
  assert.deepEqual(game.moves(completed, MIN), []);
});
