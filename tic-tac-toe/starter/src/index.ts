import { Player, Game, Score, Outcome, InvalidMoveError, NotImplementedError } from './game';
import { ConsoleGame } from './console';
import {
  State,
  Move,
  createBoard,
  createWinningLines,
  isInsideBoard,
  getWinner,
  isBoardFull,
  countOccupiedCells,
  copyState,
  parseMove,
  renderBoard,
  serializeMove,
} from './utils';

// Keep the example's public types available alongside its rules.
export { CellState, State, Move } from './utils';

/** A win requires a full row, column, or diagonal of this length. */
const BOARD_SIZE = 3;
// Coordinates depend only on the board size, so generate them once for all turns.
const WINNING_LINES = createWinningLines(BOARD_SIZE);

/** Creates a fresh empty board. */
export function initialState(): State {
  return createBoard(BOARD_SIZE);
}

/** Rules with immutable moves and scores that favor earlier wins. */
export const game: Game<State, Move> = {
  /** Supplied completion adapter: winner detection remains part of the challenge. */
  outcome(state: State): Outcome {
    const winner = getWinner(state, WINNING_LINES);
    if (winner !== null) {
      return winner;
    }
    return isBoardFull(state) ? 'draw' : 'playing';
  },

  /**
   * Marks an empty cell on a copied board.
   * @throws When coordinates are out of bounds or the cell is occupied.
   * Rejects moves after completion. Coordinates must be integers within the board.
   */
  move(state: State, [row, column]: Move, player: Player): State {
    // TODO: Reject finished games, invalid coordinates, and occupied cells; mark a copied board.
    throw new NotImplementedError('move');
  },

  /** Returns empty cells for either player, or no moves after a win or full board. */
  moves(state: State, player: Player): Move[] {
    // TODO: Return empty-cell coordinates in row-major order, unless play has ended.
    throw new NotImplementedError('moves');
  },

  /**
   * Returns positive for a MAX win, negative for a MIN win, and zero otherwise.
   * A win on five marks scores ±1/5; on seven marks it scores ±1/7. This lets
   * minimax prefer earlier wins and postpone unavoidable losses.
   * Zero represents both an unfinished position and a draw; consult `moves`
   * to distinguish them.
   */
  score(state: State): Score {
    // TODO: Evaluate the winner using the documented signed score convention.
    throw new NotImplementedError('score');
  },
};

/** Connects the rules to console setup, input, and board rendering. */
export const interactiveGame: ConsoleGame<State, Move> = {
  game,
  /** Starts an empty board with MAX (X) taking the first turn. */
  initial(): { state: State; player: Player } {
    return { state: initialState(), player: Player.MAX };
  },
  /** Accepts input such as B3; bounds and syntax errors are reported by the helper. */
  parseMove(input: string): Move {
    return parseMove(input, BOARD_SIZE);
  },
  /** Returns the labeled board as text without printing it. */
  print(state: State): string {
    return renderBoard(state);
  },
  /** Formats a move in the same letter-and-number notation used for input. */
  serializeMove(move: Move): string {
    return serializeMove(move);
  },
};
