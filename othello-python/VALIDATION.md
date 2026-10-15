# Python Othello — Validation Report

The original package was built and tested using Python 3.13.5 on Linux.
Repository integration was also checked using Python 3.14.3 on macOS: all 81 solution tests,
27 starter setup tests, six maintenance tests, the common launchers, and independent verification passed.
The project targets Python 3.11+; Windows and every supported interpreter version were not separately tested.
No third-party Python dependencies were installed or used.

After the editor-diagnostic fixes, Pyright 1.1.414 checked all 30 Python files
with zero errors and warnings using the repository configuration. Ruff's E9/F
checks also passed. Starter setup (27 tests), the reference suite (81 tests),
maintenance (six tests), and independent verification were rerun successfully
on Python 3.14.3. The starter CLI handled help, an unfinished move, board, and
quit; the reference CLI completed the forced-pass scenario via pass and A1.
These checks preserve the six intentional challenge stubs.

## Shared Acceptance Suite

| Command | Measured result | Exit |
| --- | --- | --- |
| `python3 scripts/test.py starter setup` | 27 tests passed. | 0 |
| `python3 scripts/test.py starter` | 81 total: 32 passed, 7 assertion failures, 42 missing-implementation errors. | 1 (expected) |
| `python3 scripts/test.py example` | All 81 tests passed; no skipped tests. | 0 |

The starter's failures are unfinished tasks, not a successful game. The exact same acceptance tests
are used for the completed reference. Tests exercise supplied infrastructure, public rule contracts,
Python-specific validation, board independence, actions, explicit passes, endings, and CLI behavior.

## Independent Python Verification

`python3 -m example.verification` passed with seed `20261014`:

- 128 synthetic random boards, evaluated for both players.
- 16,384 proposed-move capture comparisons against an independently written anchor-based oracle.
- 2,619 legal applied-move comparisons on those boards; illegal actions were also checked for rejection.
- 200 complete simulated games with 12,084 state transitions and 87 explicit passes.
- Eight full-game replays through the completed CLI, checking their final counts and result text.

The oracle discovers empty move endpoints by scanning from existing friendly discs over a padded,
flattened board. It does not import the candidate or reference rules. This cross-check reduces the
risk of merely repeating the reference's algorithm; it is not a proof for every possible position.

## Comparison with the JavaScript Challenge

A separate build-time comparison used the JavaScript reference corresponding to
`burdettadam/game-plus` commit `b662a82b2ec94a126cda1e01a93deb81e961c7ba`.
The supplied reference archive's core files were checked against these Git blob hashes:

| JavaScript reference file | Git blob SHA-1 |
| --- | --- |
| `src/rules.js` | `891dce35d11b61f1c7138f08c400c509a7319be7` |
| `src/game.js` | `0dfeded97755111cfd98ae10235340580344bcba` |
| `src/model.js` | `e9e608c205216be4d31c70c2a5e640df0071048b` |

Across 256 board/player cases, Python and JavaScript matched on:

- 16,384 capture queries, treating capture order as insignificant as allowed by the contract.
- 256 ordered legal-move lists and disc-count results.
- 2,347 legal move transitions, including the active player and terminal metadata.
- 256 pass outcomes or rejections and 256 final-result calculations.

Cases included synthetic boards and snapshots from legal games. This verifies game semantics,
not byte-for-byte CLI output or identical exception classes between languages.
Node.js 22.16.0 was used only for this build-time comparison; it is not a project dependency.

## Attempt Generation and Isolation

`python3 maintenance/test_scaffolding.py` passed all six maintenance tests:

- Fresh attempts contain pinned stubs, shared tests, a contract, notes, and baseline hashes, with no example/oracle/template directory.
- An existing named attempt and a marker representing candidate work are not overwritten.
- `--output` works with or without a supplied attempt name, and unsafe names are rejected.
- Edits in the source challenge do not become the next attempt's editable starting files.
- All 81 example tests pass in a disposable copy with `src/rules.py` and `src/game.py` removed.
- Starter setup works with the entire `example/` removed; inherited implementation settings cannot switch the starter test target to the solution.

The six test methods group several related assertions. They are maintenance checks, not additional
candidate scoring criteria. The attempt generator does not initialize Git or back up work automatically.

## Release Checks and Limits

All Python files compiled successfully, and their syntax was checked with Python's 3.11 grammar.
The latter is a syntax check, not a substitute for executing under Python 3.11.
The distribution ZIP was extracted into a fresh directory with spaces in its path. Setup and all
81 example acceptance tests were rerun from that extraction, followed by independent verification.
Local Markdown links were checked, and the archive excludes caches, attempts, and build-only logs.

CLI tests use subprocess streams and saved commands. Interactive terminal smoke
tests also passed on macOS. Accessibility, Windows, and every supported Python
version were not separately exercised.

Fresh attempts do not contain completed solutions. The full challenge archive intentionally does,
inside `example/`, as requested. Only the two documented source files are practice assignments.
