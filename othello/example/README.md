# Othello — Completed Example

A working implementation of the Othello challenge. The practice stubs remain in `../src/`; this example has its own source and uses the shared behavior tests in `../tests/`.

## Play

Use Node.js 22 or later. No dependency installation or build is needed.

From `othello/`:

```sh
npm run example
```

Enter coordinates such as `D3`. The commands `moves`, `score`, `board`, `pass`, `help`, and `quit` are also available. Two people share the terminal.

To run directly from this directory:

```sh
npm start
```

## Verify

From `othello/`:

```sh
npm run test:example
```

Or from this directory:

```sh
npm test
npm run test:verification
```

The suite includes the 72 behavior tests and two independent verification tests. Verification compares 128 seeded boards with a separate rules oracle and simulates 100 complete seeded games.

## Implementation

`src/rules.js` implements captures, legal moves, move application, and disc counts. `src/game.js` implements turn changes, explicit passes, completion, and results.

Captures are collected from the original board before a move is applied to a copy. A blocked opponent remains the next player until an explicit `pass`. The game ends when neither player has a legal move; disc counts determine the outcome.

Read the [practice instructions](../README.md) for the rules and data contracts. The original detailed challenge specification is also preserved in [docs/CHALLENGE.md](docs/CHALLENGE.md).

## Scenarios

From this directory:

```sh
npm start -- --position scenarios/forced-pass.json
npm start -- --position scenarios/both-blocked.json
npm start -- --position scenarios/final-draw.json
```

## License

[MIT](LICENSE).
