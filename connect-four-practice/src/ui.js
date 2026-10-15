/** Supplied terminal parsing and presentation. No game-rule implementation. */
import { COLS, assertBoard, countDiscs } from './model.js';

/**
 * @param {string} input
 * @returns {{type:'drop', column:number}|{type:'help'|'board'|'moves'|'score'|'quit'}}
 */
export function parseCommand(input) {
  if (typeof input !== 'string') throw new TypeError('Input must be text.');
  const text = input.trim().toLowerCase();
  if (/^[1-7]$/.test(text)) return { type: 'drop', column: Number(text) - 1 };
  if (['help', 'board', 'moves', 'score', 'quit'].includes(text)) return { type: text };
  throw new TypeError(`Enter a column from 1 to ${COLS}, or type help.`);
}

/** @param {import('./model.js').Board} board @returns {string} */
export function renderBoard(board) {
  assertBoard(board);
  const rows = board.map((row) => `| ${row.join(' ')} |`);
  return ['  1 2 3 4 5 6 7', ...rows, '+---------------+'].join('\n');
}

/** @param {import('./model.js').Board} board @returns {string} */
export function renderCounts(board) {
  const { red, yellow, empty } = countDiscs(board);
  return `Discs: R=${red}, Y=${yellow}, empty=${empty}.`;
}

export const HELP = [
  '1-7   Drop your disc in that column.',
  'moves List legal columns.',
  'score Show disc counts (counts do not decide the winner).',
  'board Show the board.',
  'help  Show commands.',
  'quit  Exit.',
].join('\n');

export const USAGE = [
  'Usage: node src/cli.js [--example] [--position FILE] [--help]',
  '',
  'Without --example, the CLI loads src/rules.js and src/game.js.',
  '--example explicitly loads the completed implementation in example/src/.',
  '--position loads a local JSON test position instead of an empty board.',
].join('\n');

/** @param {string[]} args */
export function parseArgs(args) {
  const result = { example: false, position: null, help: false };
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--example' && !result.example) result.example = true;
    else if (args[i] === '--help' && !result.help) result.help = true;
    else if (args[i] === '--position' && result.position === null) {
      const next = args[++i];
      if (!next || next.startsWith('--')) throw new TypeError('--position needs a file path.');
      result.position = next;
    } else throw new TypeError(`Unknown or duplicate argument: ${args[i]}`);
  }
  return result;
}
