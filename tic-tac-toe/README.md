# Tic-Tac-Toe Coding Challenge

Implement four rule functions in a supplied TypeScript CLI game. The completed solution stays in [example/](example/README.md). See the [repository overview](../README.md) for practice goals and demonstrated skills.

## Prepare

Use Node.js 22 or later and Yarn. From the repository root:

```sh
cd tic-tac-toe
yarn install
npm run test:setup
npm start
```

The supplied shell opens before the rules are complete. It accepts help, board, and quit. Commands that use unfinished functions report Not implemented and leave the session usable.

## Editable Files and Contracts

| File | Function | Required behavior |
| --- | --- | --- |
| src/utils.ts | getWinner | Return the player filling a winning line, or null, without modifying input. |
| src/index.ts | game.move | Reject noninteger/out-of-bounds coordinates, occupied cells, and actions after completion. Return an independent board with one new mark. |
| src/index.ts | game.moves | Return fresh empty-cell coordinates in row-major order; no moves after a win or draw. |
| src/index.ts | game.score | Return ±1 / occupiedCells for wins and zero for active positions or draws. |

Read the [full contract and checkpoints](docs/CHALLENGE.md). Initialization, line generation, input validation, rendering, completion adapter, CLI, and minimax are supplied. Leave their signatures intact.

Completion uses game.outcome, which returns playing, draw, or a winning Player. Numeric score is for AI evaluation. Expected rule rejections throw InvalidMoveError; unfinished stubs throw NotImplementedError. An invalid action does not consume a turn.

## Implement and Check

Work through winner detection, move application, legal moves, and scoring. Then exercise complete sessions.

```sh
npm run test:rules
npm run test:game
npm run test:cli
npm test
```

Every test command prints the selected starter or example path and rebuilds the selected TypeScript implementation. The 40 core tests cover rules, state isolation, outcomes, and CLI behavior. An untouched starter passes its nine setup tests; rule-dependent tests fail until the stubs work.

Run npm run typecheck to check source, example, and pinned templates without emitting files. The workspace uses the installed TypeScript compiler for both builds and editor diagnostics.

Use uppercase coordinates such as B2. Player 1 is X (MAX); player 2 is O (MIN). Other commands are moves, score, board, help, and quit. npm start rebuilds after edits; npm run compile is also available separately.

## Start a Fresh Attempt

From this directory:

```sh
npm run practice:new -- session-1
```

This creates ../attempts/session-1 with pinned challenge stubs, supplied scaffolding, tests, and instructions. It excludes the completed example, dependencies, and build output. Install dependencies in the new directory before practicing. Earlier attempts are never overwritten.

Use the [session worksheet](docs/SESSION-NOTES.md) to record behavior, evidence, and remaining gaps.

## Review the Example

From this directory:

```sh
npm run example
npm run example -- --player2 ai
npm run test:example
```

The starter and solution run the same behavior suite. Example builds go to example/lib; starter builds go to lib.

Minimax is an optional study topic. After the rules work, run npm run test:ai for the starter or npm run test:example:ai for the solution. Explain how both players choose scores and how pruning works; implementing the search is not part of the core challenge.

## Layout

```text
src/           Supplied framework and four editable stubs
tests/         Shared behavior suite for starter and solution
scripts/       Explicit test target selection and compilation
starter/src/   Pinned editable stubs for fresh attempts
docs/          Standalone challenge contract and session worksheet
example/       Completed source and separate build configuration
```

## License

[MIT](../LICENSE). Based on [pauldraper/game-plus](https://github.com/pauldraper/game-plus).
