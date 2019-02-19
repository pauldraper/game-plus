import { Actor, Game, Player } from './game';

export class AiConsoleActor<State, Move> implements Actor<State, Move> {
  constructor(
    private readonly game: ConsoleGame<State, Move>,
    private readonly ai: Actor<State, Move>,
  ) {}

  async nextMove(state: State, player: Player) {
    const move = await this.ai.nextMove(state, player)!;
    if (move == null) {
      throw new Error('AI returned no result');
    }
    console.log(this.game.serializeMove(move));
    return move;
  }
}

export class ConsoleActor<State, Move> implements Actor<State, Move> {
  constructor(private readonly game: ConsoleGame<State, Move>) {}

  async nextMove(state: State, player: Player) {
    while (true) {
      const input = await new Promise<string>(resolve => {
        process.stdin.once('data', data => {
          resolve(data.toString());
        });
      });
      try {
        return this.game.parseMove(input);
      } catch (e) {
        console.error(`Invalid move: ${e.message}`);
      }
    }
  }
}

export interface ConsoleGame<State, Move> {
  game: Game<State, Move>;
  initial(): {
    state: State;
    player: Player;
  };
  parseMove(input: string): Move;
  print(state: State): string;
  serializeMove(move: Move): string;
}
