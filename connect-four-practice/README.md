# Connect Four Coding Challenge

Complete six functions in a supplied JavaScript terminal game. The completed solution is in [example/](example/README.md). Practice goals and demonstrated skills live in the [repository overview](../README.md).

## Prepare

Use Node.js 22 or later. There are no third-party dependencies or build step.

```sh
cd connect-four-practice
npm run test:setup
npm start
```

The starter already renders the board and accepts help, board, score, and quit. Commands using unfinished functions report Not implemented without silently loading the solution.

## Editable Files and Contracts

Edit only:

```text
src/rules.js   getDropRow, getLegalColumns, getWinner, isDraw, dropDisc
src/game.js    playMove
```

Read the [full contract and checkpoints](docs/CHALLENGE.md). Keep the supplied validation and signatures. Queries preserve input; successful actions return independent boards; invalid actions preserve state and the current player.

Discs fall into a six-row, seven-column board. R starts, followed by Y. Four or more connected discs in any direction win. A full board without a winner draws; a win on the last square must be reported as a win.

## Implement and Check

Work through placement, legal columns, wins/draws, copied moves, and turn transitions.

```sh
npm run test:rules
npm run test:game
npm run test:cli
npm test
```

Every command prints the selected starter or example path. Both implementations use the same 78 behavior tests. The untouched starter passes 26 setup tests; gameplay tests fail until the stubs work. No acceptance tests are skipped.

Enter a column from 1 to 7, or moves, score, board, help, or quit. Full-column rejection does not consume a turn. Unexpected programming errors remain visible.

## Start a Fresh Attempt

```sh
npm run practice:new -- session-1
```

This creates ../attempts/session-1 using pinned stubs and current supplied scaffolding. It excludes the solution, dependencies, and build output, and refuses to overwrite an earlier attempt. Run setup checks before timing and record results in the [session worksheet](docs/SESSION-NOTES.md).

## Review the Completed Example

```sh
npm run example
npm run test:example
npm run test:example -- rules
npm run verify:example
```

The solution lives in example/src/. It shares supplied model and CLI infrastructure but never loads the practice rule/game stubs. Deeper verification checks every four-cell window, 1,000 seeded full games, and saved endgame replays.

For a quick win, enter 1, 7, 2, 7, 4, 6, 3 on separate lines.

## Saved Positions

```sh
npm run example -- --position scenarios/near-horizontal-win.json
```

Use npm start -- --position PATH to test your own implementation.

| Scenario | Input | Expected behavior |
| --- | --- | --- |
| full-column.json | 1, then 2 | Reject the full column and retain the turn. |
| diagonal-down.json | 2 | Complete a descending diagonal. |
| diagonal-up.json | 5 | Complete the opposite diagonal. |
| final-draw.json | 6 | Fill the board and draw. |
| final-square-win.json | 6 | Win on the final square. |

Saved -replay.json files contain command histories; they are not position inputs.

## Layout

```text
src/             Supplied scaffolding and six editable stubs
tests/           Shared behavior suite
scripts/test.cjs Explicit test-target selection
starter/src/     Pinned editable files for fresh attempts
docs/            Standalone contract and session worksheet
scenarios/       Edge cases and saved histories
example/
  src/           Complete rules, transitions, and explicit CLI entry point
  verification/ Independent oracle and deeper checks
```

See [VALIDATION.md](VALIDATION.md) for verification coverage.

## License

[MIT](LICENSE). Game rules are described in [Hasbro's instructions](https://instructions.hasbro.com/en-us/instruction/connect-4-game-instructions).
