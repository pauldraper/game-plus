import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { assertBoard } from '../src/model.js';
import { parsePosition } from '../src/state.js';

export const ROOT = fileURLToPath(new URL('../', import.meta.url));
if (
  !process.env.CHALLENGE_SOURCE ||
  !['starter', 'example'].includes(process.env.CHALLENGE_TARGET)
) {
  throw new Error('Run scripts/test.cjs with an explicit starter or example target.');
}
export const MODE = process.env.CHALLENGE_TARGET === 'example' ? 'example' : 'practice';
export const rules = await import(pathToFileURL(resolve(process.env.CHALLENGE_SOURCE, 'rules.js')));
export const { playMove } = await import(
  pathToFileURL(resolve(process.env.CHALLENGE_SOURCE, 'game.js'))
);

export function boardOf(...rows) {
  const board = rows.map((row) => [...row]);
  assertBoard(board);
  return board;
}

export function freezeBoard(board) {
  for (const row of board) Object.freeze(row);
  return Object.freeze(board);
}

export function scenario(name) {
  return parsePosition(readFileSync(new URL(`../scenarios/${name}.json`, import.meta.url), 'utf8'));
}

export function replay(name) {
  return JSON.parse(
    readFileSync(new URL(`../scenarios/${name}-replay.json`, import.meta.url), 'utf8'),
  );
}

export function completedFixture(name) {
  const state = scenario(name);
  const lastColumn = replay(name).moves.at(-1) - 1;
  // The supplied full-board fixtures each lack exactly one top-row disc.
  if (state.board[0][lastColumn] !== '.') throw new Error('Bad final-square fixture.');
  state.board[0][lastColumn] = state.player;
  return state.board;
}

export function runCli(input, args = [], { example = MODE === 'example' } = {}) {
  const result = spawnSync(
    process.execPath,
    [example ? 'example/src/cli.js' : 'src/cli.js', ...args],
    {
      cwd: ROOT,
      input,
      encoding: 'utf8',
      timeout: 5000,
      maxBuffer: 2 * 1024 * 1024,
    },
  );
  if (result.error) throw result.error;
  return result;
}
