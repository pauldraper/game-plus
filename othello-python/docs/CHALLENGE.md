# Python Othello Challenge Contract

Complete six functions in `src/rules.py` and `src/game.py` in a 90-minute practice session.
Keep signatures, public validation, and supplied infrastructure intact. Only these two files need editing.

## Rules

Use an 8 by 8 board with `B`, `W`, and `.` for black, white, and empty. The supplied opening board
has White at D4/E5 and Black at E4/D5. Black starts.

A legal placement must be on an empty square and bracket one or more consecutive opposing discs
between the new disc and an existing friendly disc. This applies in eight straight-line directions.
Flip every directly bracketed line; do not jump gaps, wrap edges, or start chain captures from a flipped disc.

Passing is explicit, required when no move exists, and forbidden otherwise. The game ends when
neither player can move, even if squares remain empty. More discs wins; equal counts draw.

## Types

```python
Board = list[list[str]]
Move(row: int, col: int)            # frozen dataclass; zero-based coordinates
State(board, player, status)       # frozen dataclass; status "playing" or "finished"
```

`State` metadata is frozen but its board is not. Queries preserve their inputs. Successful actions
return independent state/board snapshots with distinct row lists. Failed actions change nothing.
Use the supplied `clone_board` helper. Board reachability and validating the history behind a
synthetic position are outside scope.

## Functions

| Function | Required behavior |
| --- | --- |
| `get_flips(board, player, move)` | Return captured `Move` objects, no duplicates. Order is not significant. Return `[]` for an occupied square or a move with no captures. Preserve input. |
| `get_legal_moves(board, player)` | Return every legal `Move` in row-major order. Preserve input and return a fresh list. |
| `apply_move(board, player, move)` | Reject occupied/noncapturing actions with `InvalidMoveError`. Return an independent board with exactly the new disc and all direct captures changed. |
| `count_discs(board)` | Return `{"black": ..., "white": ..., "empty": ...}` totaling 64. |
| `play_move(state, move)` | Reject finished games. Apply the move and switch player, even if the move ends the game. Finish if neither side can move; otherwise retain `playing`, including when the next player must pass. |
| `pass_turn(state)` | Reject finished games or passing when a move exists. Switch if the opponent can move. Otherwise finish and retain the current player. Return an independent board even though no discs change. |

`create_game` and `get_result` are supplied. `get_result` returns `None` while playing, otherwise a
dict with black/white/empty counts, `winner` (`B`, `W`, or `None`), and `draw` (boolean).

## Exceptions

Supplied validation raises `TypeError` for malformed data, including boolean/fractional coordinates,
and `ValueError` for integer coordinates outside 0 through 7. Illegal game actions raise the supplied
`InvalidMoveError`. Stubs initially raise `MissingImplementationError` (a `NotImplementedError` subclass).

Do not swallow unexpected errors or return success for unfinished functionality. The CLI handles
expected illegal moves without consuming a turn; unexpected coding errors fail visibly.

## Supplied, Not Required to Implement

Data classes, schema checks, initial board, independent-board copying, coordinate parsing, terminal
rendering, JSON fixtures, test infrastructure, and input loop are supplied. No GUI, service, minimax
opponent, database, packaging framework, or third-party library is needed.

## Checks and Commands

```sh
python3 scripts/test.py starter setup
python3 scripts/test.py starter rules
python3 scripts/test.py starter game
python3 scripts/test.py starter cli
python3 scripts/test.py starter
python3 -m src.cli
```

Input: `D3`-style coordinates, `moves`, `score`, `board`, `pass`, `help`, or `quit`.
Lowercase and surrounding whitespace are accepted. The shell remains usable before the rules are complete.

You can load `scenarios/forced-pass.json`, `scenarios/both-blocked.json`, or `scenarios/final-draw.json`:

```sh
python3 -m src.cli --position scenarios/forced-pass.json
```

## What's Intended to Be Tested and What Knowledge Is Being Demonstrated

| Intended test | Demonstrated knowledge |
| --- | --- |
| Complete a supplied contract | Read unfamiliar code and keep rules separate from presentation. |
| Implement directional captures | Bounds, two-dimensional iteration, and precise rule translation. |
| Enumerate actions predictably | Lists, reusable conditions, and documented ordering. |
| Preserve state independence | Nested-list copying, object identity, and Python dataclass limitations. |
| Handle passes and results | Explicit state transitions, invariants, and terminal conditions. |
| Reject invalid actions | Consistent exceptions and updates that occur only after validation. |
| Demonstrate completed behavior | Focused tests, debugging, integration checks, and prioritization. |

These are independent practice objectives, not a published employer rubric. The untouched full
suite intentionally has failing tests; a working setup does not mean the challenge is solved.

At 90 minutes, record working/partial/missing features and demonstrate an edge case. Review the
completed example only afterward. Do not turn the timer into a requirement to hide unfinished work.
