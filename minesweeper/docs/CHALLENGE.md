# Minesweeper Challenge Contract

Implement six functions in src/rules.js and src/game.js. Generation, seeded replay, first-reveal protection, validation, copying, input parsing, rendering, progress counts, fixtures, and the CLI are supplied.

Reveal every safe cell without revealing a mine. Each clue counts the eight surrounding mines, excluding the selected cell. A zero opens its connected zero region and safe numbered boundary. Flags are guesses: they block opening and traversal, but correctly flagging all mines does not itself win.

State has three independent boolean grids (mines, revealed, flagged), status ('playing', 'won', or 'lost'), exploded (null or a coordinate after loss), and firstRevealPending. Internal coordinates are zero-based [row, column]; the CLI accepts letters and one-based rows.

| Function | Required behavior |
| --- | --- |
| getNeighbors(mines, row, column) | Return in-bounds neighbors in row-major order, excluding self. |
| countAdjacentMines(mines, row, column) | Count neighboring mines, excluding the selected cell. |
| getRevealCells(state, row, column) | Return newly exposed safe cells in row-major order without mutation. A mine, flag, or revealed start returns []. A numbered start returns itself. Zeros traverse the unflagged zero region and numbered boundary. Existing revealed zeros may connect a region but are omitted from the output. |
| isWon(state) | Derive whether every safe cell is revealed and no mine is revealed; ignore flags and status as shortcuts. |
| revealCell(state, row, column) | Use the supplied prepareReveal copy. On a mine hit reveal only that mine and record lost/exploded. Otherwise expose getRevealCells and derive won/playing using isWon. |
| toggleFlag(state, row, column) | Toggle one hidden cell's flag on a copied state. Preserve protection and other metadata. Reject revealed cells and completed games. |

prepareReveal validates the action, clones all grids, relocates a protected first-click mine to the first safe square, and consumes protection only in the copy. Calculate region/clue results against that prepared state. Generation is reproducible but does not guarantee a zero first clue or a puzzle solvable without guessing. Fixed scenarios do not protect the first reveal unless explicitly enabled.

Queries preserve all inputs. Successful actions return independent state, grids, and rows. Failed actions change nothing and do not consume protection. Supplied checks raise TypeError or RangeError for malformed arguments; well-formed illegal actions raise InvalidMoveError.

The default game is 9×9 with 10 mines. The CLI supports 1–99 rows and 1–26 columns; rules support larger rectangular grids up to 256×256. At least one safe cell is required. Chording, undo, and a solver are outside scope.

## Checkpoints

1. Implement neighbor geometry and mine counts.
2. Traverse reveal regions while respecting flags and visited cells.
3. Derive the win predicate from the grids.
4. Implement reveal and flag actions using independent copies.
5. Check first-click protection, mine hits, and complete CLI games.

## Commands

    npm run test:setup
    npm run test:rules
    npm run test:game
    npm run test:cli
    npm test
    npm start

Use A1, open A1, flag A1, board, status, help, or quit. Inputs are case-insensitive. Use --seed TEXT for reproducible generated boards, or --position scenarios/small-win.json and reveal C3 for a deterministic win. Change --mines along with dimensions when choosing a small board.
