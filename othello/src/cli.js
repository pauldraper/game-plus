import { createInterface } from 'node:readline';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createGame, playMove, passTurn, getResult } from './game.js';
import { getLegalMoves, countDiscs } from './rules.js';
import { assertState, cloneBoard, InvalidMoveError, NotImplementedError } from './model.js';
import { parseCommand, renderBoard, formatMove, HELP } from './ui.js';

/** Supplied CLI. The unmodified starter opens, renders, and accepts help/quit. */
export async function runCli({ input = process.stdin, output = process.stdout,
  initialState = createGame() } = {}) {
  assertState(initialState);
  let state = { ...initialState, board: cloneBoard(initialState.board) };
  const lines = createInterface({ input, crlfDelay: Infinity, terminal: false });
  const print = text => output.write(`${text}\n`);
  const prompt = () => output.write(`${state.player} > `);
  const announce = () => {
    print(renderBoard(state.board));
    if (state.status === 'finished') {
      const result = getResult(state);
      print(`Final score: B ${result.black}, W ${result.white}, empty ${result.empty}`);
      print(result.draw ? 'Draw.' : `${result.winner} wins.`);
      return true;
    }
    print(`Turn: ${state.player}`);
    return false;
  };

  print('Othello - independent CLI practice');
  print('Type help for commands. Stubs report what still needs implementation.');
  try {
    if (announce()) return state;
    prompt();
    for await (const line of lines) {
      try {
        const command = parseCommand(line);
        if (command.kind === 'quit') { print('Session ended.'); return state; }
        if (command.kind === 'help') print(HELP);
        else if (command.kind === 'board') print(renderBoard(state.board));
        else if (command.kind === 'moves') {
          const moves = getLegalMoves(state.board, state.player);
          print(moves.length ? moves.map(formatMove).join(', ') : 'No legal moves. Use pass.');
        } else if (command.kind === 'score') {
          const score = countDiscs(state.board);
          print(`B ${score.black}, W ${score.white}, empty ${score.empty}`);
        } else if (command.kind === 'pass' || command.kind === 'move') {
          // Assign only after a completed, valid transition.
          const next = command.kind === 'pass' ? passTurn(state) : playMove(state, command.move);
          assertState(next);
          state = next;
          if (announce()) return state;
        }
      } catch (error) {
        if (error instanceof NotImplementedError) print(`Not implemented: ${error.message}`);
        else if (error instanceof InvalidMoveError) print(`Invalid move: ${error.message}`);
        else throw error; // Programming errors must remain visible, not become input errors.
      }
      prompt();
    }
    print('Session ended (end of input).');
    return state;
  } finally {
    lines.close();
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === '--help') {
    console.log('Usage: node src/cli.js [--position scenarios/forced-pass.json]\n' + HELP);
    return;
  }
  let initialState;
  if (args.length) {
    if (args.length !== 2 || args[0] !== '--position') {
      throw new Error('Usage: node src/cli.js [--position path/to/state.json]');
    }
    initialState = JSON.parse(await readFile(resolve(args[1]), 'utf8'));
    assertState(initialState);
  }
  await runCli(initialState ? { initialState } : {});
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  });
}
