# Othello Challenge Contract

Implement six functions in src/rules.js and src/game.js. Public validation, initialization, CLI, input parsing, rendering, and result formatting are supplied.

| Function | Required behavior |
| --- | --- |
| getFlips(board, player, move) | Return all captured coordinates without duplicates. Return [] for occupied cells or moves with no captures. Preserve input. |
| getLegalMoves(board, player) | Return legal coordinates in row-major order without modifying the board. |
| applyMove(board, player, move) | Reject occupied or noncapturing actions with InvalidMoveError. Return an independent board containing the new disc and all captures. |
| countDiscs(board) | Return { black, white, empty }; counts total 64. |
| playMove(state, move) | Reject finished games. Apply a move and switch player. Finish if neither player has a move; otherwise retain playing, even when the next player must pass. |
| passTurn(state) | Reject finished games and passing when a legal move exists. Switch if the opponent can move; otherwise finish and retain the player. Return an independent board snapshot. |

The board is 8×8; B and W are players and . is empty. Black starts. Moves are zero-based { row, col } coordinates. State contains board, player, and status ('playing' or 'finished').

A legal move brackets at least one uninterrupted sequence of opposing discs between the new disc and a friendly endpoint. Scan all eight directions and flip every captured line. Do not cross empty squares or the board edge, or trigger chain captures.

Passing is explicit, required when no legal move exists, and forbidden otherwise. Play ends when neither side can move, even with empty squares. Larger disc counts win; equal counts draw. Preserve input states and all row arrays.

Malformed public inputs raise TypeError or RangeError through supplied validation; well-formed illegal actions raise InvalidMoveError.

## Checkpoints and Commands

Work through captures, legal moves, applying moves, counts, turns, and passes.

    npm run test:setup
    npm run test:rules
    npm run test:game
    npm run test:cli
    npm test
    npm start

Use D3-style coordinates, moves, score, board, pass, help, or quit. Lowercase coordinates are accepted. The CLI reports unfinished functions and lets you continue using supplied commands.

Try npm start -- --position scenarios/forced-pass.json, scenarios/both-blocked.json, and scenarios/final-draw.json for endgame checks.
