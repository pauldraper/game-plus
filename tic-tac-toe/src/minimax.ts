import { Score, Player, Game, Actor } from './game';
import shuffleArray = require('shuffle-array');

/**
 * Chooses a move assuming both players make optimal decisions.
 *
 * Searches until outcome reports completion; there is no depth limit or
 * repetition detection. Games must have finite search trees and must return
 * independent successor states from `move` so sibling branches stay intact.
 * Turns alternate strictly: an active player with no moves is a contract
 * error. Forced passes are unsupported. Alpha-beta pruning skips branches that cannot
 * improve an ancestor's choice.
 *
 * @typeParam State - The game's position representation.
 * @typeParam Move - The game's move representation.
 */
export class Minimax<State, Move> implements Actor<State, Move> {
  /** Supplies the rules for generating successors and scoring leaf positions. */
  constructor(private readonly game: Game<State, Move>) {}

  /**
   * Searches the game tree from the current state.
   *
   * @param state - Position to explore without modifying it.
   * @param player - Player choosing a move at this node.
   * @returns A local move and its propagated score. A pruned node may return
   * a score bound rather than an exact value; the initial unbounded search
   * still selects an optimal move.
   */
  private search(state: State, { alpha, beta }: SearchBounds, player: Player): SearchResult<Move> {
    if (this.game.outcome(state) !== 'playing') {
      return { move: null, score: this.game.score(state) };
    }
    const moves = this.game.moves(state, player);
    if (!moves.length) {
      // Only leaf positions are evaluated directly; parents inherit child scores.
      throw new Error('An active position must have a legal move; minimax does not model passes');
    }

    // Shuffle in place. Strict score comparisons keep the first equally good
    // move encountered, giving ties a randomized outcome.
    shuffleArray(moves);

    let bestResult: SearchResult<Move>;
    switch (player) {
      case Player.MAX:
        bestResult = { move: null, score: -Infinity };
        for (const move of moves) {
          // MAX chooses the child with the highest evaluated score.
          const childResult = this.search(
            this.game.move(state, move, player),
            { alpha, beta },
            Player.MIN,
          );
          if (bestResult.move === null || bestResult.score < childResult.score) {
            // Keep this node's move, not the opponent's move returned by the child.
            bestResult = { score: childResult.score, move };
          }
          // MAX can guarantee at least this score from the explored children.
          alpha = Math.max(alpha, bestResult.score);
          if (beta <= alpha) {
            // MIN can already obtain beta or less elsewhere; it need not choose
            // this branch, whose score is at least alpha (including equality).
            break;
          }
        }
        break;
      case Player.MIN:
        bestResult = { move: null, score: Infinity };
        for (const move of moves) {
          // MIN chooses the child with the lowest evaluated score.
          const childResult = this.search(
            this.game.move(state, move, player),
            { alpha, beta },
            Player.MAX,
          );
          if (bestResult.move === null || childResult.score < bestResult.score) {
            bestResult = { score: childResult.score, move };
          }
          // MIN can guarantee at most this score from the explored children.
          beta = Math.min(beta, bestResult.score);
          if (beta <= alpha) {
            // MAX can already obtain alpha or more elsewhere, so further
            // exploration of this branch cannot improve its decision.
            break;
          }
        }
        break;
    }

    return bestResult!;
  }

  /**
   * Searches with initially unrestricted score bounds.
   *
   * @returns An optimal move, or `null` if the game is complete.
   * Although the interface returns a promise, the search itself runs
   * synchronously and can block the event loop on large game trees.
   */
  async nextMove(state: State, player: Player): Promise<Move | null> {
    return this.search(state, { alpha: -Infinity, beta: Infinity }, player).move;
  }
}

/** The current lower and upper bounds used by alpha-beta pruning. */
type SearchBounds = {
  /** Best lower bound available to MAX along the current search path. */
  alpha: Score;
  /** Best upper bound available to MIN along the current search path. */
  beta: Score;
};

/** A candidate move together with its evaluated score. */
type SearchResult<Move> = {
  /** Chosen move at this node; `null` at a leaf. */
  move: Move | null;
  /** Propagated evaluation, possibly a bound when this node was pruned. */
  score: Score;
};
