/** Shared CLI. Example code is loaded only when --example is explicitly selected. */
import { readFile } from 'node:fs/promises';
import { createInterface } from 'node:readline';
import { pathToFileURL } from 'node:url';
import { InvalidMoveError, NotImplementedError } from './model.js';
import { createInitialState, getResult, parsePosition } from './state.js';
import { HELP, USAGE, parseArgs, parseCommand, renderBoard, renderCounts } from './ui.js';

/** @param {string[]} args */
export async function main(args = process.argv.slice(2), mode = 'practice') {
  let options;
  let state;
  try {
    options = parseArgs(args);
    options.example = options.example || mode === 'example';
    if (options.help) {
      console.log(USAGE);
      return;
    }
    state = options.position
      ? parsePosition(await readFile(options.position, 'utf8'))
      : createInitialState();
  } catch (error) {
    console.error(`Configuration error: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  // No fallback: an unfinished practice method never substitutes the example.
  const rules = options.example
    ? await import('../example/src/rules.js')
    : await import('./rules.js');
  const game = options.example ? await import('../example/src/game.js') : await import('./game.js');
  console.log(`Connect Four | ${options.example ? 'EXAMPLE' : 'PRACTICE'} mode | R starts`);
  console.log(renderBoard(state.board));
  console.log('Enter a column 1-7. Type help for commands.');

  function announceResult() {
    const result = getResult(state);
    if (!result) return false;
    console.log(result.draw ? 'Draw: the board is full.' : `Winner: ${result.winner}.`);
    console.log(renderCounts(state.board));
    return true;
  }
  if (announceResult()) return;

  const input = createInterface({ input: process.stdin, crlfDelay: Infinity, terminal: false });
  const prompt = () => process.stdout.write(`Player ${state.player} > `);
  prompt();
  try {
    for await (const line of input) {
      let command;
      try {
        command = parseCommand(line);
      } catch (error) {
        console.log(`Invalid input: ${error.message}`);
        prompt();
        continue;
      }
      try {
        if (command.type === 'quit') {
          console.log('Goodbye.');
          break;
        }
        if (command.type === 'help') console.log(HELP);
        else if (command.type === 'board') console.log(renderBoard(state.board));
        else if (command.type === 'score') console.log(renderCounts(state.board));
        else if (command.type === 'moves') {
          const columns = rules.getLegalColumns(state.board);
          console.log(
            `Legal columns: ${columns.length ? columns.map((col) => col + 1).join(', ') : 'none'}.`,
          );
        } else {
          state = game.playMove(state, command.column);
          console.log(renderBoard(state.board));
          if (announceResult()) break;
        }
      } catch (error) {
        if (error instanceof InvalidMoveError) {
          console.log(`Invalid move: ${error.message}`);
        } else if (error instanceof NotImplementedError) {
          console.log(error.message);
        } else {
          // A coding defect should fail visibly, not masquerade as a player's bad input.
          throw error;
        }
      }
      prompt();
    }
  } finally {
    input.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.stack ?? String(error));
    process.exitCode = 1;
  });
}
