/**
 * A participant that can choose a move for a game state.
 *
 * @typeParam State - The type used to represent the current game state.
 * @typeParam Move - The type used to represent a legal move.
 */
export interface Actor<State, Move> {
  /**
   * Selects the next move for the given player.
   *
   * The promise allows actors to obtain moves asynchronously, such as from
   * console input or a time-consuming AI search. A `null` result means that
   * the actor has no move to make.
   *
   * @param state - Current position from which to choose a move.
   * @param player - Side whose turn it is.
   * @returns The selected move, or `null` when none is selected.
   */
  nextMove(state: State, player: Player): Promise<Move | null>;
}

/**
 * The rules and evaluation functions for a turn-based game.
 *
 * @typeParam State - The type used to represent the current game state.
 * @typeParam Move - The type used to represent a move.
 */
export interface Game<State, Move> {
  /** Reports completion independently of numeric AI evaluation. No forced passes are modeled. */
  outcome(state: State): Outcome;

  /**
   * Applies a move for a player and returns the resulting state.
   * Implementations used by minimax must leave the supplied state unchanged.
   * Move validation and any errors are defined by the concrete game.
   */
  move(state: State, move: Move, player: Player): State;

  /**
   * Returns the legal moves available to a player, or an empty array if none exist.
   * Active positions must have at least one move; minimax shuffles arrays in place.
   * return an array that can be reordered without changing the game state.
   */
  moves(state: State, player: Player): Move[];

  /**
   * Evaluates the state for minimax.
   *
   * Higher scores favor `Player.MAX`; lower scores favor `Player.MIN`.
   * The meaning of zero and the magnitude of a win are game-specific.
   * Minimax evaluates positions when outcome reports completion.
   */
  score(state: State): Score;
}

/**
 * The two sides used by the minimax search.
 *
 * `MAX` tries to maximize the game score, while `MIN` tries to minimize it.
 */
export enum Player {
  /** Side that prefers larger scores; player one in the console runner. */
  MAX,
  /** Side that prefers smaller scores; player two in the console runner. */
  MIN,
}

/** A numeric evaluation of a game state. */
export type Score = number;

/** A game is active, drawn, or won by one of the two players. */
export type Outcome = 'playing' | 'draw' | Player;

/** Expected user error; the CLI reports it and keeps the same turn. */
export class InvalidMoveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidMoveError';
  }
}

/** Marks a challenge stub without disguising unexpected programming errors. */
export class NotImplementedError extends Error {
  constructor(functionName: string) {
    super(functionName);
    this.name = 'NotImplementedError';
  }
}
