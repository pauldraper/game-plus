# Othello Python Coding Challenge

Complete six game-rule and turn-management functions in a supplied terminal application. The completed solution stays in [example/](example/README.md). Practice goals and demonstrated skills live in the [repository overview](../README.md).

## Prepare

Use Python 3.11 or later. The project uses only the standard library: no pip installation or build step is needed.

```sh
cd othello-python
python3 scripts/run.py test:setup
python3 scripts/run.py start
```

On Windows, use py -3 in place of python3 if appropriate. The starter opens, renders, and accepts help, board, and quit before you implement the rules. Commands needing unfinished functions report Not implemented and keep the shell usable.

## Editable Files and Contracts

| File | Function | Required behavior |
| --- | --- | --- |
| src/rules.py | get_flips | Find captured discs without mutating the board. |
| src/rules.py | get_legal_moves | Return legal moves in row-major order. |
| src/rules.py | apply_move | Place and capture discs on an independent board. |
| src/rules.py | count_discs | Count black, white, and empty cells. |
| src/game.py | play_move | Apply a move, advance the player, and determine completion. |
| src/game.py | pass_turn | Validate an explicit pass and switch or finish. |

Read the [full contract](docs/CHALLENGE.md). Initialization, validation, copying, input parsing, rendering, result formatting, and the CLI are supplied. Work through captures, legal moves, copied moves, counts, turns, and passes.

Move(row=2, col=3) represents D3. State uses frozen dataclasses for metadata, but the nested board lists remain mutable. Every successful action must return independent board rows. Boolean coordinates are rejected; malformed values raise TypeError, out-of-range integers raise ValueError, and illegal actions raise InvalidMoveError.

## Implement and Check

```sh
python3 scripts/run.py test:rules
python3 scripts/run.py test:game
python3 scripts/run.py test:cli
python3 scripts/run.py test
```

Every test command prints its explicit target and path. Starter and solution use the same 81 acceptance tests. The untouched starter passes 27 setup tests; gameplay tests fail until the stubs work. Inherited environment variables cannot select the solution.

Use D3-style coordinates, moves, score, pass, board, help, or quit. Coordinates and commands are case-insensitive. Invalid actions preserve state and do not consume turns. Neither player having a move ends the game, even with empty cells.

The lower-level runner remains available for focused unittest options:

```sh
python3 scripts/test.py starter rules -k opening
python3 scripts/test.py starter game --failfast
```

Optional developer checks can be run from the repository root:

```sh
npx --yes pyright
ruff check --select E9,F othello-python
```

The root pyrightconfig.json supplies the Python import path and checks against
Python 3.11. Pyright is fetched by npx; Ruff must be installed separately.
Neither tool is needed to run the challenge. Negative tests intentionally cast
malformed fixtures to Any so runtime validation remains tested without editor
type errors. Starter gameplay failures remain expected until the six tasks are complete.

## Common npm Commands (Optional)

If Node.js 22 or later is installed, the same commands as the other challenges are available, with no npm install:

```sh
npm start
npm run test:setup
npm run test:rules
npm run test:game
npm run test:cli
npm test
npm run example
npm run test:example
npm run verify:example
npm run practice:new -- python-session-1
```

The npm adapter finds Python 3.11 or later using python3, python, or the Windows py launcher. Set PYTHON to an interpreter executable if needed. Native Python commands work independently of these wrappers.

## Start a Fresh Attempt

```sh
python3 scripts/run.py practice:new python-session-1
python3 scripts/run.py practice:new python-session-2 --output ../python-attempts
```

The default output is the repository's shared attempts/ directory. Names are optional when --output is supplied. Generated attempts contain pinned stubs, current supplied scaffolding, shared tests, instructions, and ATTEMPT.json baseline hashes. They exclude solutions, caches, and build output and never overwrite earlier work.

The root workflow also supports:

```sh
node scripts/create-attempt.cjs othello-python python-session-3
```

Run setup checks before timing and record behavior and evidence in the [session worksheet](docs/SESSION-NOTES.md).

## Review the Example

```sh
python3 scripts/run.py example
python3 scripts/run.py test:example
python3 scripts/run.py verify:example
python3 scripts/run.py example --position scenarios/forced-pass.json
```

For the forced-pass scenario, enter pass, then A1. The solution functions live in example/src/ and never import the practice rules or lifecycle. Independent verification compares 128 random boards and 200 complete games with a separately written oracle, including full CLI replays.

Direct module entry points remain available: python3 -m src.cli, python3 -m example.src.cli, and python3 -m example.verification. The older python3 -m example spelling remains supported.

## Layout

```text
src/             Supplied model, CLI, and six editable stubs
tests/           Shared acceptance suite
scripts/         Native dispatcher, test runner, attempt generator, npm adapter
starter/src/     Pinned editable files for fresh attempts
docs/            Contract, session worksheet, integration notes
scenarios/       Deterministic pass and endgame positions
maintenance/     Isolation and fresh-attempt checks
example/
  src/           Completed rules, lifecycle, and explicit CLI entry point
  verification/ Independent oracle
```

See [VALIDATION.md](VALIDATION.md) for verification results and [integration notes](docs/INTEGRATION.md) for the repository workflow.

## License

[MIT](LICENSE). This port preserves the supplied JavaScript Othello practice contract.
