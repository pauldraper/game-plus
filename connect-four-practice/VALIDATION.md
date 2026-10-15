# Build Validation

The original package was validated on Node.js 22.16.0 on Linux. After standardizing this repository, setup, all 78 solution tests, three deeper verification groups, CLI entry points, and fresh-attempt generation also passed on Node.js v25.8.2 on macOS. No dependencies were installed.

## Shared Test Suites

| Command | Pass | Fail | Expected exit | Interpretation |
| --- | ---: | ---: | ---: | --- |
| `npm run test:setup` | 26 | 0 | 0 | Supplied model, validation, input handling, rendering, loader, and CLI shell work. |
| `npm test` | 29 | 49 | 1 | Untouched practice stubs intentionally leave gameplay unfinished. |
| `npm run test:example` | 78 | 0 | 0 | Completed implementation satisfies the same acceptance tests. |
| `npm run verify:example` | 3 | 0 | 0 | Independent example-verification groups pass. |

No tests were skipped, cancelled, or marked as expected failures. A failing starter run is not a passing or complete game. Use `npm run example` to run the completed game.

## Independent Example Checks

The review-only oracle lives in `example/verification/oracle.js` and uses sentinel-separated, column-major bitboards rather than the reference implementation's directional window scan.

- **690 explicit winner/nonwinner comparisons** cover all **69** four-cell windows for both players, then remove each of the four cells in turn to verify that an incomplete line is not a win.
- **1,000 deterministic full games** compare available columns, disc placement, winner detection, draw detection, turn progression, board independence, nonmutation, gravity, and terminal rejection. This run covered **20,974 state transitions**, producing **998 wins and 2 draws** with seed `0xC04F2026`.
- **Four complete saved replays** verify the reachable pre-final fixtures and confirm that games first end on their last recorded move: final draw (42 turns), final-square win (42), descending diagonal (23), and ascending diagonal (35).

This provides independent cross-checks, not a proof over every possible board position.

## Integration and Isolation

The shared suite includes complete subprocess-driven terminal games, both diagonal slopes, an entire 42-turn draw, a final-square win, malformed input, full-column rejection, EOF handling, and position loading from a path containing spaces.

Additional build checks confirmed:

- All JavaScript files pass `node --check`.
- The default practice CLI reports missing methods rather than silently loading the reference.
- Practice setup and the expected starter-test baseline still work with the entire `example/` folder removed from a disposable copy.
- All 78 example tests still pass with the two practice rule/lifecycle files removed from a disposable copy.
- Package scripts support example-only test-group selection without shell-specific environment syntax.
- A complete seven-turn horizontal-win game runs through the documented `npm run example` command.
- Local Markdown links resolve to files included in the package.
- The archive was extracted into a fresh directory and the example, setup, starter-baseline, and independent-verification commands were rerun there.

## Limits

Linux/Node 22 and macOS/Node 25 were exercised. Windows, screen-reader behavior, and a human-operated interactive terminal were not separately tested. CLI checks use subprocess input/output and EOF.

The position loader validates schema and gravity, not complete historical legality or the truth of supplied terminal metadata. Boards with wins for both players are outside the rules contract.

Use the recorded cases to review rule correctness and state isolation. Practice goals and demonstrated skills are documented in the repository overview.
