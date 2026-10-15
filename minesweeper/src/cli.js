import { createInterface } from 'node:readline';
import { randomBytes } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { createGame, loadScenario } from './state.js';
import { InvalidMoveError, NotImplementedError } from './model.js';
import { loadImplementation } from './implementation.js';
import { parseCommand, renderBoard, progressText, HELP } from './ui.js';

const USAGE = `Minesweeper CLI
node src/cli.js [--example] [--seed TEXT] [--rows 9] [--columns 9] [--mines 10]
node src/cli.js [--example] --position scenarios/small-win.json
Generated boards protect the first successful reveal; fixed scenarios do not
unless firstRevealPending is explicitly true. No no-guess guarantee is made.
The CLI supports 1-99 rows and 1-26 columns. --position cannot be combined with
board-generation options. Use --help to display this message.`;
function options(args) {
  const result = {
    mode: 'practice',
    rows: 9,
    columns: 9,
    mines: 10,
    seed: null,
    position: null,
    help: false,
  };
  const seen = new Set();
  for (let i = 0; i < args.length; i++) {
    const name = args[i];
    if (seen.has(name)) throw new RangeError(`Repeated option: ${name}`);
    seen.add(name);
    if (name === '--example') {
      result.mode = 'example';
      continue;
    }
    if (name === '--help') {
      result.help = true;
      continue;
    }
    if (!['--rows', '--columns', '--mines', '--seed', '--position'].includes(name))
      throw new RangeError(`Unknown option: ${name}`);
    const value = args[++i];
    if (!value || value.startsWith('--')) throw new RangeError(`Missing value for ${name}`);
    if (['--rows', '--columns', '--mines'].includes(name)) {
      if (!/^\d+$/.test(value)) throw new RangeError(`${name} must be a nonnegative integer.`);
      result[name.slice(2)] = Number(value);
    } else result[name.slice(2)] = value;
  }
  if (result.position && ['--rows', '--columns', '--mines', '--seed'].some((x) => seen.has(x))) {
    throw new RangeError('--position cannot be combined with generation options.');
  }
  if (result.rows < 1 || result.rows > 99 || result.columns < 1 || result.columns > 26)
    throw new RangeError('CLI dimensions must be 1-99 rows and 1-26 columns.');
  return result;
}
export async function main(args = process.argv.slice(2), mode = 'practice') {
  let opt, state;
  try {
    opt = options(args);
    if (mode === 'example') opt.mode = 'example';
    if (opt.help) {
      console.log(USAGE);
      return;
    }
    opt.seed ??= randomBytes(6).toString('hex');
    state = opt.position
      ? loadScenario(opt.position)
      : createGame(opt.rows, opt.columns, opt.mines, opt.seed);
    if (state.mines.length > 99 || state.mines[0].length > 26)
      throw new RangeError('Scenario is too large for this terminal interface.');
  } catch (error) {
    console.error(`Setup error: ${error.message}`);
    process.exitCode = 1;
    return;
  }
  const impl = await loadImplementation(opt.mode);
  const display = () => {
    try {
      console.log(renderBoard(state, impl.countAdjacentMines));
    } catch (error) {
      if (error instanceof NotImplementedError) console.log(error.message);
      else throw error;
    }
    console.log(progressText(state));
  };
  const finish = () => {
    if (state.status === 'won') console.log('You win! Every safe cell is revealed.');
    else if (state.status === 'lost') console.log('You hit a mine. Game over.');
  };
  console.log(`Minesweeper — ${opt.mode} mode.`);
  if (opt.position)
    console.log(
      `Position: ${opt.position}. First reveal ${state.firstRevealPending ? 'protected' : 'not protected'}.`,
    );
  else
    console.log(
      `Seed: ${opt.seed}. First successful reveal is safe; it is not guaranteed to open a zero region.`,
    );
  console.log('Type help for commands.');
  display();
  if (state.status !== 'playing') {
    finish();
    return;
  }
  const input = createInterface({ input: process.stdin, crlfDelay: Infinity, terminal: false });
  try {
    if (process.stdin.isTTY) process.stdout.write('> ');
    for await (const line of input) {
      let command;
      try {
        command = parseCommand(line, state.mines.length, state.mines[0].length);
      } catch (error) {
        if (!(error instanceof TypeError || error instanceof RangeError)) throw error;
        console.log(`Invalid input: ${error.message}`);
        if (process.stdin.isTTY) process.stdout.write('> ');
        continue;
      }
      if (command.type === 'quit') {
        console.log('Goodbye.');
        break;
      }
      try {
        switch (command.type) {
          case 'open':
            state = impl.revealCell(state, ...command.position);
            display();
            break;
          case 'flag':
            state = impl.toggleFlag(state, ...command.position);
            display();
            break;
          case 'board':
            display();
            break;
          case 'status':
            console.log(progressText(state));
            break;
          case 'help':
            console.log(HELP);
            break;
        }
      } catch (error) {
        if (error instanceof NotImplementedError) console.log(error.message);
        else if (error instanceof InvalidMoveError) console.log(`Invalid move: ${error.message}`);
        else throw error; // Programming bugs must not be disguised as bad user input.
      }
      if (state.status !== 'playing') {
        finish();
        break;
      }
      if (process.stdin.isTTY) process.stdout.write('> ');
    }
  } finally {
    input.close();
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`Unexpected error: ${error.stack || error.message}`);
    process.exitCode = 1;
  });
}
