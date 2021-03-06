import { Score, Player, Game, Actor } from './game';
import * as shuffleArray from 'shuffle-array';

export class Minimax<State, Move> implements Actor<State, Move> {
  constructor(private readonly _game: Game<State, Move>) {}

  private _alphaBeta(state: State, { min, max }: Range, player: Player): Result<Move> {
    const moves = this._game.moves(state, player);
    if (!moves.length) {
      return { move: null, score: this._game.score(state) };
    }

    shuffleArray(moves);

    let best: Result<Move>;
    switch (player) {
      case Player.MAX:
        best = { move: null, score: -Infinity };
        for (const move of moves) {
          const result = this._alphaBeta(
            this._game.move(state, move, player),
            { min, max },
            Player.MIN,
          );
          if (best.move === null || best.score < result.score) {
            best.score = result.score;
            best.move = move;
          }
          min = Math.max(min, best.score);
          if (max <= min) {
            break;
          }
        }
        break;
      case Player.MIN:
        best = { move: null, score: Infinity };
        for (const move of moves) {
          const result = this._alphaBeta(
            this._game.move(state, move, player),
            { min, max },
            Player.MAX,
          );
          if (best.move === null || result.score < best.score) {
            best.score = result.score;
            best.move = move;
          }
          max = Math.min(max, best.score);
          if (max <= min) {
            break;
          }
        }
        break;
    }

    return best!;
  }

  async nextMove(state: State, player: Player): Promise<Move | null> {
    return this._alphaBeta(state, { min: -Infinity, max: Infinity }, player).move;
  }
}

type Range = { min: Score; max: Score };

type Result<Move> = { move: Move | null; score: Score };
