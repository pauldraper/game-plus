/**
 * Supplied command-line shell. Importing this module does not start a session.
 * Game completion uses outcome; score is only an AI evaluation.
 */
import 'source-map-support/register';
import { createInterface } from 'readline';
import { ArgumentParser } from 'argparse';
import { AiConsoleActor } from './console';
import { ConsoleGame } from './console';
import { interactiveGame, State } from './index';
import { Player, InvalidMoveError, NotImplementedError } from './game';
import { Minimax } from './minimax';

export type PlayerMode = 'console' | 'ai';
export const HELP = 'Commands: A1-style move, moves, score, board, help, quit.';

/** Runs a session using injectable streams so the supplied shell can be tested. */
export async function runCli({
  input = process.stdin,
  output = process.stdout,
  player1 = 'console',
  player2 = 'console',
  game = interactiveGame,
}: {
  input?: NodeJS.ReadableStream;
  output?: NodeJS.WritableStream;
  player1?: PlayerMode;
  player2?: PlayerMode;
  game?: ConsoleGame<State, import('./utils').Move>;
} = {}): Promise<State> {
  let { state, player } = game.initial();
  const modes: PlayerMode[] = [player1, player2];
  const ai = new AiConsoleActor(game, new Minimax(game.game), output);
  const lines = createInterface({ input, crlfDelay: Infinity, terminal: false });
  // Subscribe before awaiting anything so piped lines and EOF cannot be lost.
  const iterator = lines[Symbol.asyncIterator]();
  const print = (text: string) => output.write(text + '\n');
  print(game.print(state));
  print(HELP);

  try {
    while (true) {
      const automatic = modes[player] === 'ai';
      if (!automatic) {
        output.write('Player ' + (player + 1) + ' > ');
      }
      try {
        let move;
        if (automatic) {
          move = await ai.nextMove(state, player);
          if (move === null) {
            throw new Error('AI returned no move in an active game');
          }
        } else {
          const next = await iterator.next();
          if (next.done) {
            print('Session ended (end of input).');
            return state;
          }
          const command = next.value.trim();
          if (command === '') continue;
          if (command.toLowerCase() === 'quit') {
            print('Session ended.');
            return state;
          }
          if (command.toLowerCase() === 'help') {
            print(HELP);
            continue;
          }
          if (command.toLowerCase() === 'board') {
            print(game.print(state));
            continue;
          }
          if (command.toLowerCase() === 'moves') {
            print(game.game.moves(state, player).map(game.serializeMove).join(', '));
            continue;
          }
          if (command.toLowerCase() === 'score') {
            print('Evaluation: ' + game.game.score(state));
            continue;
          }
          move = game.parseMove(command);
        }

        // Commit the state and advance turns only after a successful transition
        // and completion check. Partial implementations leave the current turn intact.
        const nextState = game.game.move(state, move, player);
        const outcome = game.game.outcome(nextState);
        state = nextState;
        print(game.print(state));
        if (outcome !== 'playing') {
          print(outcome === 'draw' ? 'Draw.' : 'Player ' + (outcome + 1) + ' wins.');
          return state;
        }
        player = player === Player.MAX ? Player.MIN : Player.MAX;
      } catch (error) {
        if (error instanceof NotImplementedError) {
          print('Not implemented: ' + error.message);
          // An unfinished AI search must not spin forever; allow commands instead.
          if (automatic) modes[player] = 'console';
        } else if (error instanceof InvalidMoveError && !automatic) {
          print('Invalid move: ' + error.message);
        } else {
          throw error;
        }
      }
    }
  } finally {
    lines.close();
  }
}

/** CLI-only argument parsing stays outside the importable session function. */
async function main(): Promise<void> {
  const parser = new ArgumentParser();
  parser.addArgument('game', { choices: ['ttt'] });
  parser.addArgument('--player1', { choices: ['ai', 'console'], defaultValue: 'console' });
  parser.addArgument('--player2', { choices: ['ai', 'console'], defaultValue: 'console' });
  const args = parser.parseArgs();
  await runCli({ player1: args.player1, player2: args.player2 });
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Error: ' + error.message);
    process.exitCode = 1;
  });
}
