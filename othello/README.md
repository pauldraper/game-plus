# Othello — 90-Minute CLI Implementation Practice

Complete the missing rules in a supplied command-line game. The application shell, input handling, board display, data types, and tests are ready. Your work is in **six functions across two JavaScript files**.

See the [challenge overview](../README.md) for interview-preparation goals, demonstrated skills, and a suggested practice session.

## Start Here

Use Node.js **22 or later**. The project has **no third-party dependencies**, no build step, and requires no `npm install`. Once Node is installed, the code and tests run offline.

```bash
cd othello
node --version
npm run test:setup
npm start
```

The unmodified starter opens the board and supports `help`, `board`, and `quit`. Features that depend on incomplete rules report `Not implemented` without closing the application.

```bash
npm test
```

**Gameplay failures are intentional at the start.** The delivered starter has 72 tests: 25 pass and 47 fail because the six implementations are missing. The dedicated setup suite has 21 passing tests.

Edit only:

```text
src/rules.js    getFlips, getLegalMoves, applyMove, countDiscs
src/game.js     playMove, passTurn
```

The `example/` directory contains the completed game and additional verification. Your practice implementation stays in `src/`; the example is tested separately.

Read the [standalone contract and checkpoints](docs/CHALLENGE.md). Work through captures, legal moves, applying moves, counts, turns, and passes, then demonstrate the CLI.

### Create a Fresh Attempt

From this directory, run npm run practice:new -- session-1. It creates ../attempts/session-1 using pinned editable stubs and current supplied scaffolding. The new attempt contains no solution, dependencies, or build output and cannot overwrite an earlier attempt. Run its setup tests before starting your timer.

### Run the Completed Example

From `othello/`:

```bash
npm run example
npm run test:example
```

To try an endgame position with the completed implementation:

```bash
npm run example -- --position scenarios/forced-pass.json
```

See [example/README.md](example/README.md) for implementation and verification details.

## The Game

Use an 8×8 board. `B` is Black, `W` is White, and `.` is empty. Black moves first from this position:

```text
    A B C D E F G H
 1  . . . . . . . .
 2  . . . . . . . .
 3  . . . . . . . .
 4  . . . W B . . .
 5  . . . B W . . .
 6  . . . . . . . .
 7  . . . . . . . .
 8  . . . . . . . .
```

A move must occupy an empty square and bracket at least one uninterrupted line of opposing discs between the new disc and an existing friendly disc. Lines may run horizontally, vertically, or diagonally. Flip all bracketed opposing discs in every qualifying direction. An empty square or a friendly disc stops a line; flipping a disc does not trigger further chain captures.

A player must pass when no legal move exists and cannot pass otherwise. Play ends when neither player can move, even with empty squares remaining. Compare the discs actually on the board: the larger count wins and equal counts draw. This mock does not implement tournament clocks or tournament scoring adjustments. Rules reference: [World Othello Federation][rules].

The fixture coordinates, symbols, error types, and explicit `pass` command below are local interface conventions.

## Data Contract

All code is JavaScript. JSDoc describes the types without requiring TypeScript tooling.

```js
// Board: eight independent arrays, each containing eight '.', 'B', or 'W' cells.
// Move: zero-based coordinates, unlike the terminal's A1-H8 labels.
const move = { row: 2, col: 3 }; // D3

// Game state: player is the next player asked to act.
const state = {
  board: /* Board */,
  player: 'B',             // 'B' or 'W'
  status: 'playing',       // 'playing' or 'finished'
};
```

Input parsing, validation helpers, board initialization, and final-result formatting are supplied. Preserve their contracts. Malformed public arguments raise `TypeError` or `RangeError`; a well-formed but illegal action raises `InvalidMoveError`.

### Implement the Six Stubs

| Function | Required behavior |
| --- | --- |
| `getFlips(board, player, move)` | Return captured coordinates without duplicates. Order does not matter. Return `[]` for occupied squares or moves with no captures. Never mutate input. |
| `getLegalMoves(board, player)` | Return every legal move in row-major order: increasing row, then column. Return `[]` if none exist. |
| `applyMove(board, player, move)` | Return a new board containing the placed disc and all valid flips. Reject occupied/no-capture actions with `InvalidMoveError`. Do not reuse input row arrays. |
| `countDiscs(board)` | Return `{ black, white, empty }`; the three counts must total 64. |
| `playMove(state, move)` | Reject a finished game. Apply a legal action, set the next player to the opponent, and finish immediately if neither player can move. Otherwise retain `playing`, even if that next player needs to pass. |
| `passTurn(state)` | Reject a finished game or a player who has a legal move. If the opponent can move, return a new state on that opponent. If neither can move, finish and retain the current player. Always return an independent board snapshot. |

Do **not** silently skip a blocked opponent inside `playMove`. The CLI uses an explicit pass so turn behavior can be tested separately.

For a finished state, the supplied `getResult` function returns counts plus `winner: 'B' | 'W' | null` and `draw: boolean`. It returns `null` while play continues. The supplied function derives the result from your disc counts; you do not need an infinity-based scoring convention.

A state loaded from a fixture is validated structurally, not proven reachable from the standard opening. Terminal fixtures marked `playing` are resolved with `pass` when neither player can act.

## Terminal Commands

| Input | Behavior |
| --- | --- |
| `D3` | Place a disc. Lowercase and surrounding whitespace are accepted. |
| `pass` | Pass only when no move exists. |
| `moves` | List legal moves; this is game functionality, not an implementation hint. |
| `score` | Show current counts. |
| `board` | Display the board again. |
| `help` | Show the command list. |
| `quit` | Leave the session. |

The CLI catches expected input errors and reports missing implementations. Unexpected programming errors remain visible and exit unsuccessfully rather than being disguised as invalid moves.

## Tests and Completion

```bash
npm run test:setup   # Supplied shell, parsing, validation, and initialization.
npm run test:rules   # Captures, legal moves, applying moves, and counts.
npm run test:game    # Turns, explicit passes, completion, and results.
npm run test:cli     # Rule-dependent terminal behavior.
npm test            # All 72 starter tests.
```

Tests contain expected behavior, not an alternative implementation. There are no skipped tests, automatic passing stubs, or invented pass thresholds. Some validation and setup tests already pass because that infrastructure is provided.

Every test command prints the selected implementation. Default commands explicitly select the starter; npm run test:example selects the solution. Both run the same files in tests/, so behavior contracts cannot drift between duplicate suites. Independent oracle checks run only for the example.

### Manual Edge-Case Positions

These are synthetic test positions, not recorded games. They avoid playing a full match just to examine a pass or endgame.

```bash
npm start -- --position scenarios/forced-pass.json
npm start -- --position scenarios/both-blocked.json
npm start -- --position scenarios/final-draw.json
```

They work with your implementation as it becomes complete. Normal startup without arguments always uses the standard opening.

## Project Layout

```text
src/
  model.js           Supplied constants, types, validation, and initial board.
  rules.js           Four challenge stubs.
  game.js            Two challenge stubs; supplied setup/result helpers.
  ui.js              Supplied parsing, rendering, and command definitions.
  cli.js             Supplied terminal application.
tests/               Setup, rule, lifecycle, and terminal behavior tests.
example/             Completed implementation and independent verification.
scripts/             Explicit test-target selection.
starter/src/         Pinned editable stubs for new attempts.
scenarios/           Small synthetic positions for manual checks.
docs/
  CHALLENGE.md       Standalone rules, contracts, and checkpoints.
  CONTEXT.md         Implementation scope and technical references.
  SESSION-NOTES.md   Practice results worksheet.
VALIDATION.md        Build-time verification and expected starter failures.
```

## References and License

[World Othello Federation rules][rules] define the game behavior. The project uses the [Node.js built-in test runner][node-tests]. Implementation context is documented in [CONTEXT.md](docs/CONTEXT.md).

MIT; see [LICENSE](LICENSE).

[rules]: https://www.worldothello.org/about/about-othello/othello-rules/official-rules/english
[node-tests]: https://nodejs.org/api/test.html
