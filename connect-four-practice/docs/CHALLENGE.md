# Connect Four Challenge Contract

Implement six functions in src/rules.js and src/game.js. Model validation, state creation, result formatting, gravity checks, input parsing, rendering, fixtures, and the CLI are supplied.

The board has six rows and seven columns. R starts; Y is the other player; . is empty. Row zero is the top. Internal columns are zero-based; the terminal accepts 1 through 7. Discs fall to the lowest empty cell. Four or more contiguous matching discs horizontally, vertically, or along either diagonal win. A full board with no winner draws; a final-square win takes precedence over a draw.

| Function | Required behavior |
| --- | --- |
| getDropRow(board, column) | Return the lowest empty row or -1 for a full column. This placement query does not check whether the game is finished. |
| getLegalColumns(board) | Return available columns in ascending order, or [] after a win or full board. |
| getWinner(board) | Return R, Y, or null. Detect every orientation, including lines longer than four and starts away from an edge. |
| isDraw(board) | Return true only for a full board without a winner. |
| dropDisc(board, player, column) | Reject a full column or an already-won board with InvalidMoveError. Return a new board with exactly one added disc and independent rows. |
| playMove(state, column) | Reject finished games. Apply the move and set terminal status/winner, retaining the last player on completion. Otherwise switch player and retain winner null. |

State contains board, player, status ('playing' or 'finished'), and winner (R, Y, or null). The supplied getResult reads terminal metadata; counts do not determine the winner.

Queries preserve inputs. Invalid actions do not mutate state or consume a turn. Supplied checks raise TypeError for malformed types and RangeError for invalid integer columns. Illegal game actions raise InvalidMoveError; unfinished stubs throw NotImplementedError.

Board shape, symbols, and metadata are validated. Imported scenarios also enforce gravity, but full move-history legality is outside the contract. Geometric winner queries accept synthetic layouts; positions with two winners are outside scope.

## Checkpoints

1. Find drop positions and legal columns.
2. Recognize all win directions and distinguish draws.
3. Apply a disc using independent board rows.
4. Advance turns and record completion.
5. Replay full games and recover from an invalid column.

## Commands

    npm run test:setup
    npm run test:rules
    npm run test:game
    npm run test:cli
    npm test
    npm start

Enter 1 through 7, moves, score, board, help, or quit. Try --position scenarios/full-column.json for rejection and scenarios/final-square-win.json for a win on the last square. Files ending in -replay.json are saved command histories, not CLI position files.
