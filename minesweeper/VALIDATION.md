# Validation Report

## Environment and Scope

The original package was tested with Node.js 22.16.0 on Linux x86_64. After standardizing this repository, setup, all 92 solution tests, deeper verification, CLI entry points, and fresh-attempt generation also passed with Node.js v25.8.2 on macOS. There are no third-party runtime or test dependencies.

The original archive was extracted into a fresh directory before repeating its checks. Repository checks also confirmed that the solution suite works without either practice implementation file. Windows and real interactive TTY input were not separately exercised. CLI tests use subprocess standard input/output, including EOF and queued commands.

## Shared Acceptance Tests

| Mode | Passed | Failed | Total | Exit code |
| --- | ---: | ---: | ---: | ---: |
| Setup infrastructure | 30 | 0 | 30 | 0 |
| Completed example | 92 | 0 | 92 | 0 |
| Untouched practice scaffold | 36 | 56 | 92 | 1 |

The practice failures are intentional: six functions contain named `NotImplementedError` stubs. Its 36 passing tests cover 30 supplied-infrastructure checks and six supplied action/query guard tests. The failed tests are ordinary failures, not skipped tests, TODO tests, or expected-failure annotations.

The same 92-test acceptance suite is used for practice and example modes. It checks geometry, counts, region boundaries, flags, immutable state updates, first-reveal protection, completion, and terminal integration.

**Example isolation:** Both `src/rules.js` and `src/game.js` were temporarily removed in the extracted copy. All 92 example-mode tests still passed. The example uses shared model/CLI helpers, but does not import the unfinished exercise implementation.

## Independent Verification

`npm run verify:example` completed successfully with these measured results:

| Check | Coverage |
| --- | --- |
| Mine-layout enumeration | All 511 possible 3×3 mine layouts that leave at least one safe square. |
| Neighbor geometry | 4,599 comparisons against whole-board coordinate filtering. |
| Adjacent mine counts | 4,599 comparisons against a separate coordinate-distance calculation. |
| Region reveals | 45,990 comparisons: every starting square on each layout, with no flag and with each possible single flag. |
| Reveal actions | 45,990 comparisons of resulting state or invalid-action rejection for those same cases. |
| Mixed-action simulations | 400 completed games, 8,399 actions, including 3,364 rejected actions; 46 wins and 354 losses. |
| Large-region stress test | A 128×128 mine-free board: 16,384 unique revealed cells, followed by a correct win. |
| Full CLI replays | Eight generated-board games replayed from independent expected commands through the actual terminal program, all ending in wins. |

The production example traverses a region with a queue and visited set. The independent oracle grows a set to a fixed point and computes neighborhood relationships with whole-board coordinate filtering. It does not call the production rules or action functions to calculate expected results.

The simulated games intentionally inspect complete state to choose test actions; this is not a Minesweeper-solving algorithm, and their win rate has no interpretation as playing strength. Invalid actions are checked for unchanged input. Full terminal replays exercise parsing, state transitions, output, and termination.

## Limitations

These checks are strong regression evidence, not a formal proof, security assessment, or exhaustive exploration of every possible board and action sequence. The 3×3 enumeration covers zero or one flag, not every flag subset or visibility history; larger region, bridge, and flag interactions also have targeted tests. The oracle shares the supplied initial-state factory and the agreed data contract.

First-reveal protection relocates one selected mine to the first safe position. It preserves mine count but does not guarantee a uniform conditional board or a no-guess puzzle. Fixed scenario files disable protection unless explicitly enabled.

Random generation, the first-reveal helper, parser, and renderer are provided infrastructure, not missing practice functions. The model validates structural and key metadata invariants; it does not reconstruct legal history for arbitrary imported synthetic positions.

The CLI's board renderer prioritizes clarity over large-board performance and can perform quadratic total validation work when many cells are revealed. See the example README for complexity details.

The project is independent interview practice. Neither the game selection nor the acceptance-test counts establish an employer's actual question or passing threshold.

## Reproduce

```bash
npm run test:setup
npm run test:example
npm run verify:example
npm test
```

The final command exits unsuccessfully until the exercise stubs are implemented. Machine-readable results are in [docs/validation-results.json](docs/validation-results.json).
