# Tic-Tac-Toe Challenge Contract

Implement four functions, preserving their signatures:

| Editable file | Function | Required behavior |
| --- | --- | --- |
| src/utils.ts | getWinner | Return the player filling a supplied winning line or null. Check rows, columns, and both diagonals without mutating input. |
| src/index.ts | game.move | Reject noninteger/out-of-bounds coordinates, occupied squares, and moves after completion with InvalidMoveError. Return an independent board with exactly one new mark. |
| src/index.ts | game.moves | Return empty coordinates in row-major order, or no moves after a win or draw. Return fresh coordinate arrays without mutating input. |
| src/index.ts | game.score | Return 1 / occupiedCells for a MAX win, its negative for MIN, and zero for active positions and draws. |

The board is 3×3. State is a row-major array of null, Player.MAX (X), or Player.MIN (O). Moves are zero-based integer [row, column] pairs. The caller supplies the current player; validating full board reachability is outside the challenge.

Board creation, copying, input validation, dynamic winning-line generation, rendering, the completion adapter, CLI, and minimax are supplied. Keep those contracts intact. Do not implement turn passing: an unfinished Tic-Tac-Toe game always has a legal move.

game.outcome returns 'playing', 'draw', or the winning Player. The CLI uses this explicit result; numeric score is reserved for AI evaluation. Expected illegal actions throw InvalidMoveError. Unfinished stubs throw NotImplementedError. Unexpected programming errors remain visible.

## Checkpoints

1. Implement getWinner and verify every winning direction.
2. Implement move and verify validation and independent copies.
3. Implement moves and verify ordering and completion.
4. Implement score and verify both signs and early/late wins.
5. Run full CLI win/draw sessions and retry an occupied square.

## Commands

From the attempt directory:

    yarn test:setup
    yarn test:rules
    yarn test:game
    yarn test:cli
    yarn test
    yarn compile
    yarn play ttt

Use help, board, moves, score, quit, or uppercase coordinates such as B2. Commands using unfinished functions report Not implemented and leave the shell usable. Illegal moves do not consume turns.

Minimax is an optional follow-up. Once the core works, use yarn test:ai and explain score propagation and pruning; changing the supplied search is not required.
