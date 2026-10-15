# Completed Connect Four Example

This folder contains the full implementation of the six practice functions. It shares the supplied model, state helpers, and terminal application with the starter; it does not depend on the incomplete methods in `src/rules.js` or `src/game.js`.

From the **project root**, run:

```bash
npm run example
npm run test:example
npm run verify:example
```

From this directory, npm start, npm test, and npm run verify are also available. The shared model and shell remain in ../src/; solution functions are loaded only from this directory's src/.

## Implementation Map

| File | Implemented functions |
| --- | --- |
| `src/rules.js` | `getDropRow`, `getLegalColumns`, `getWinner`, `isDraw`, `dropDisc` |
| `src/game.js` | `playMove` |

The default `npm start` command still runs your practice files. You do not need to copy this example into `src/` to play the completed game.

## Review After Your Attempt

### Placement and legal moves

`getDropRow` searches from the bottom of the requested column and returns the first empty cell. A full column returns `-1`. It answers a placement question, not whether the game has finished.

`getLegalColumns` adds the game-state restriction: an existing winner means there are no legal moves. Otherwise, it collects non-full columns in ascending order.

### Winning lines

`getWinner` examines occupied cells as possible line starts. It checks four directions: right, down, down-right, and down-left. Opposite directions would inspect the same lines in reverse.

Before inspecting cells, it checks whether the far endpoint is inside the board. This prevents accidental row wrapping and out-of-range access. A matching four-cell window is enough to prove a win; a longer line necessarily contains one.

The implementation scans the whole board rather than assuming it knows where the last move occurred. That matches the public `getWinner(board)` interface and makes saved positions straightforward to inspect.

### State isolation

`dropDisc` validates the action, copies the outer array and every row, and changes only one cell in the copy. A shallow outer-array copy alone would retain shared row references and let one state's mutation change another.

### Turns and outcomes

`playMove` rejects a completed game, applies one legal move, and evaluates the resulting board. A win takes precedence over a draw when the last square is filled.

If play continues, the state names the opponent as the next player. If play ends, it retains the player who just moved and sets terminal metadata. The shared result helper reads that metadata; it does not implement a second winner algorithm.

### Readability versus optimization

The example favors small functions with explicit validation. Some operations rescan the board because they reuse public helpers. That is a deliberate readability choice for this fixed 42-cell practice problem, not an optimized game engine.

Memoization, minimax, bitboards, and a computer opponent are not required to implement this game. The independent verifier uses bitboards to check the example by a different approach; it is review infrastructure, not part of the target solution.

## Independent Verification

```bash
npm run verify:example
```

The review-only verifier checks:

1. All 69 distinct four-cell windows for both players, plus each one-cell-gap variant: 690 explicit winner/nonwinner comparisons.
2. 1,000 deterministic legal games against an independently written bitboard oracle, including board updates, available columns, outcomes, turn transitions, nonmutation, and termination.
3. Full saved replay histories for both diagonal fixtures, the final-square draw, and the final-square win.

The independent algorithm and verifier are kept here so that normal practice tests do not include another full solution. The test runner must explicitly select example verification.

## Comparing Your Code

Run the same group against both implementations:

```bash
npm run test:rules
npm run test:example -- rules
```

A different implementation is acceptable when it satisfies the contracts. The intended knowledge is rules modeling, state management, integration, and verification—not reproducing this example line for line.

Read [the main README](../README.md) for the complete challenge, data contracts, and test objectives.
