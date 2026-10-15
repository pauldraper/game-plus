# Completed Python Othello Example

**Review after attempting the practice stubs.** This folder contains the completed six methods in src/.
It imports only supplied shared infrastructure, not `src/rules.py` or `src/game.py`.

From the challenge root:

```sh
python3 scripts/run.py example
python3 scripts/run.py test:example
python3 scripts/run.py verify:example
```

Optional npm commands from the challenge root are npm run example, npm run test:example,
and npm run verify:example. From this example directory, npm start, npm test, and npm run verify
are also available. Native commands require only Python 3.11 or later.

## Implementation Walkthrough

`get_flips` visits the eight directions from a proposed empty square. It gathers consecutive opponent
discs in a temporary line and commits that line only if an existing friendly disc closes the bracket.
Empty endpoints and board edges discard the temporary line. This avoids partial or chain captures.

`get_legal_moves` visits candidate coordinates in row-major order and reuses capture detection.
`apply_move` obtains captures before copying, then changes only the new square and captured cells in
an independent board. Every row is copied, including rows without a changed disc, to satisfy the
practice contract's isolation requirement.

`count_discs` aggregates the three cell values. `play_move` switches the player after applying a move,
then determines whether either side has a legal move. It does not automatically pass a blocked
opponent. `pass_turn` checks that the active player really is blocked, then either switches to a
playable opponent or records completion without changing the player.

The supplied `get_result` adapter handles final counts and ties. Scores count discs; they are not
minimax evaluations. These terminal-player conventions intentionally match the JavaScript Othello
contract, rather than the different convention used by the Connect Four challenge.

Practice goals and demonstrated skills are in the [repository overview](../../README.md).

## Complexity Notes

On the actual fixed 8x8 board, all rule operations have bounded cost. When discussing a hypothetical
NxN version, account for this implementation's validation, not just the inner scan:

- `get_flips` validates the whole board (O(N²)), then scans at most eight lines (O(N)).
- `get_legal_moves` may call that validated method for O(N²) candidates, giving an O(N⁴) upper bound.
- `apply_move` validates, obtains captures, and copies the board: O(N²) under this analysis.
- Counts and independent board copies take O(N²) time; copies use O(N²) additional storage.

For a larger game, an internal validated-once capture helper could reduce repeated checks and make
legal-move generation O(N³). That optimization is not needed to complete this fixed-size timed mock.
The example favors readable contract reuse over optimizing a small board.

## Independent Verification

The oracle in `verification/oracle.py` uses a padded, flattened board and scans outward from existing
friendly discs to discover legal empty endpoints. It does not call either implementation's rules.

`python3 -m example.verification` compares captures, legal moves, action results, input isolation,
turns, passes, counts, and terminal rejection. It also replays complete games through the CLI.
The verification implementation is never copied into a fresh practice attempt.

See [VALIDATION.md](../VALIDATION.md) for exact measured counts and testing limits.
