const test = require('node:test');
const assert = require('node:assert/strict');
const {
  Player: { MAX, MIN },
  Minimax,
  game: { game },
} = require('./implementation');

for (const player of [MAX, MIN]) {
  const opponent = player === MAX ? MIN : MAX;
  test('AI: player ' + player + ' takes its immediate win', async () => {
    const state = [
      [player, player, null],
      [opponent, opponent, null],
      [null, null, null],
    ];
    assert.deepEqual(await new Minimax(game).nextMove(state, player), [0, 2]);
  });
  test('AI: player ' + player + ' blocks an immediate loss', async () => {
    const state = [
      [opponent, opponent, null],
      [player, null, null],
      [null, player, null],
    ];
    assert.deepEqual(await new Minimax(game).nextMove(state, player), [0, 2]);
  });
}

test('AI: terminal positions return no move', async () => {
  assert.strictEqual(
    await new Minimax(game).nextMove(
      [
        [MAX, MAX, MAX],
        [MIN, MIN, null],
        [null, null, null],
      ],
      MIN,
    ),
    null,
  );
});
