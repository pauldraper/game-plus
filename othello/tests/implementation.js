import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

export const source = process.env.CHALLENGE_SOURCE;
if (!source) throw new Error('Run tests through scripts/test.cjs with an explicit target');
const load = (file) => import(pathToFileURL(resolve(source, file)));
const model = await load('model.js');
const rules = await load('rules.js');
const game = await load('game.js');
const ui = await load('ui.js');
export const {
  SIZE,
  BLACK,
  WHITE,
  EMPTY,
  InvalidMoveError,
  NotImplementedError,
  assertPlayer,
  assertBoard,
  assertMove,
  assertState,
  otherPlayer,
  cloneBoard,
  createInitialBoard,
} = model;
export const { getFlips, getLegalMoves, applyMove, countDiscs } = rules;
export const { createGame, playMove, passTurn, getResult } = game;
export const { parseMove, formatMove, parseCommand, renderBoard, HELP } = ui;
