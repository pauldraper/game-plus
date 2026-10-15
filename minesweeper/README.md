# Minesweeper Coding Challenge

Complete six functions in a supplied JavaScript terminal game. The completed solution is in [example/](example/README.md). Practice goals and demonstrated skills live in the [repository overview](../README.md).

## Prepare

Use Node.js 22 or later. There are no third-party dependencies or build step.

```sh
cd minesweeper
npm run test:setup
npm start
```

The starter displays the covered board and accepts help, board, status, and quit. Game actions report unfinished functions by name; the starter never silently substitutes the solution.

## Editable Files and Contracts

Edit only:

```text
src/rules.js   getNeighbors, countAdjacentMines, getRevealCells, isWon
src/game.js    revealCell, toggleFlag
```

Read the [full contract and checkpoints](docs/CHALLENGE.md). Validation, mine generation, copying, first-reveal protection, rendering, and the CLI are supplied.

Reveal every safe cell without opening a mine. Clues count surrounding mines. A zero opens the connected zero region and safe numbered boundary. Flags block reveals and traversal; flagging mines alone does not win.

Queries preserve input. Actions return independent copies of all three grids and metadata. Calculate reveal regions against the supplied prepareReveal copy, since first-click protection can relocate a mine.

## Implement and Check

Work through neighbor geometry, clues, reveal traversal, win detection, and reveal/flag actions.

```sh
npm run test:rules
npm run test:game
npm run test:cli
npm test
```

Every command prints the selected implementation. Starter and solution use the same 92 behavior tests; the untouched starter passes 30 setup tests. Gameplay failures remain until the six stubs work.

Enter coordinates such as A1, open A1, flag A1, board, status, help, or quit. Coordinates are case-insensitive. Covered cells use #, flags F, revealed zeros ., and numbered clues 1–8. A loss displays the detonated mine as X.

## Start a Fresh Attempt

```sh
npm run practice:new -- session-1
```

This creates ../attempts/session-1 with pinned stubs, current supplied scaffolding, tests, and instructions. It excludes the solution, dependencies, and build output, and preserves earlier attempts. Run setup checks before timing and use the [session worksheet](docs/SESSION-NOTES.md).

## Review the Completed Example

```sh
npm run example
npm run test:example
npm run test:example -- rules
npm run verify:example
```

The complete rules and actions are in example/src/. They use supplied infrastructure but never import the practice rule/game stubs. Deeper verification includes every valid 3×3 mine layout, mixed-action games, large-region traversal, and full CLI replays.

## Reproduce a Board or Scenario

The default game is 9×9 with 10 mines. Generated boards protect the first successful reveal but do not guarantee a zero clue or a puzzle solvable without guessing.

```sh
npm run example -- --seed practice
npm run example -- --rows 6 --columns 8 --mines 9 --seed another-board
npm run example -- --position scenarios/small-win.json
```

In small-win.json, reveal C3 to finish. Use npm start with the same options for your implementation. Fixed scenarios do not protect the first reveal unless explicitly enabled. Set --mines too when reducing dimensions.

| Scenario | Input | Expected behavior |
| --- | --- | --- |
| numbered-start.json | B2 | Reveal one numbered cell. |
| flag-block.json | C3, flag A1, A1 | Remove a false flag and reveal the final safe cell. |
| last-safe.json | B2 | Win without needing to flag the mine. |
| first-click-protected.json | A1 | Relocate the selected mine before revealing. |
| loss.json | A1 | Lose on a fixed mine. |
| wrong-flag-loss.json | A1 | Lose and display an incorrect flag as !. |

The CLI supports 1–99 rows and 1–26 columns. Rules support larger rectangular boards up to 256×256. Revealing an already-open cell, chording, undo, and a solver are outside the exercise.

## Layout

```text
src/             Supplied scaffolding and six editable stubs
tests/           Shared behavior suite
scripts/test.cjs Explicit test-target selection
starter/src/     Pinned editable files for fresh attempts
docs/            Standalone contract, worksheet, and recorded validation
scenarios/       Deterministic edge cases
example/
  src/           Complete rules, actions, and explicit CLI entry point
  verification/ Independent oracle and deeper checks
```

See [VALIDATION.md](VALIDATION.md) for coverage and the example walkthrough for algorithm details.

## License

[MIT](LICENSE). Game mechanics are described in [Simon Tatham's Mines documentation](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/mines.html).
