/** Supplied text interface. No game-rule algorithms live here. */
import { assertBoard, assertMove, InvalidMoveError } from './model.js';

export function parseMove(input) {
  if (typeof input !== 'string' || !/^[a-h][1-8]$/i.test(input.trim())) {
    throw new InvalidMoveError('Use a coordinate such as D3, or type help.');
  }
  const text = input.trim().toUpperCase();
  return { row: Number(text[1]) - 1, col: text.charCodeAt(0) - 65 };
}

export function formatMove(move) {
  assertMove(move);
  return String.fromCharCode(65 + move.col) + String(move.row + 1);
}

export function parseCommand(input) {
  const text = input.trim();
  const command = text.toLowerCase();
  if (['help', 'quit', 'board', 'moves', 'score', 'pass', ''].includes(command)) {
    return { kind: command || 'empty' };
  }
  return { kind: 'move', move: parseMove(text) };
}

export function renderBoard(board) {
  assertBoard(board);
  return ['    A B C D E F G H',
    ...board.map((row, index) => ` ${index + 1}  ${row.join(' ')}`)].join('\n');
}

export const HELP = `Commands:
  A1-H8  Place a disc (for example D3; case-insensitive).
  pass   Pass only when no legal move is available.
  moves  List legal moves for the current player.
  score  Show current disc counts.
  board  Show the board again.
  help   Show this help.
  quit   End this session.
Only src/rules.js and src/game.js contain challenge stubs.`;
