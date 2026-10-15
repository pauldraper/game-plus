import { createInterface, Interface } from 'readline';
import { Actor, Game, Player, InvalidMoveError } from './game';

/** Wraps an AI actor and prints its selected move to the supplied stream. */
export class AiConsoleActor<State, Move> implements Actor<State, Move> {
  constructor(
    private readonly game: ConsoleGame<State, Move>,
    private readonly ai: Actor<State, Move>,
    private readonly output: NodeJS.WritableStream = process.stdout,
  ) {}

  async nextMove(state: State, player: Player): Promise<Move | null> {
    const move = await this.ai.nextMove(state, player);
    if (move !== null) {
      this.output.write(this.game.serializeMove(move) + '\n');
    }
    return move;
  }
}

/**
 * Reads complete lines rather than arbitrary stdin chunks.
 * Illegal move application belongs to the runner; syntax errors are retried here.
 * Call close when abandoning an actor before end-of-input.
 */
export class ConsoleActor<State, Move> implements Actor<State, Move> {
  private readonly lines: Interface;
  private readonly iterator: AsyncIterableIterator<string>;

  constructor(
    private readonly game: ConsoleGame<State, Move>,
    input: NodeJS.ReadableStream = process.stdin,
    private readonly output: NodeJS.WritableStream = process.stdout,
  ) {
    this.lines = createInterface({ input, crlfDelay: Infinity, terminal: false });
    this.iterator = this.lines[Symbol.asyncIterator]();
  }

  async nextMove(state: State, player: Player): Promise<Move | null> {
    while (true) {
      const next = await this.iterator.next();
      if (next.done) {
        return null;
      }
      try {
        return this.game.parseMove(next.value);
      } catch (error) {
        if (!(error instanceof InvalidMoveError)) {
          throw error;
        }
        this.output.write('Invalid move: ' + error.message + '\n');
      }
    }
  }

  close(): void {
    this.lines.close();
  }
}

/** Input, display, and setup operations separate from a game's pure rules. */
export interface ConsoleGame<State, Move> {
  game: Game<State, Move>;
  initial(): { state: State; player: Player };
  /** Throws InvalidMoveError for rejected user input. */
  parseMove(input: string): Move;
  print(state: State): string;
  serializeMove(move: Move): string;
}
