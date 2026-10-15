import { assertState, parseCoordinate } from './model.js';
import { getProgress } from './state.js';
export const HELP = `Commands:
  A1 / open A1 / reveal A1   Reveal a cell.
  flag A1 / f A1            Toggle a flag on a hidden cell.
  board                    Display the board again.
  status                   Show mine, flag, and safe-cell counts.
  help                     Display this help.
  quit                     Exit. End-of-file also exits cleanly.
Legend: # hidden, F flag, . revealed zero, 1-8 clue.
At game end: * mine, X exploded mine, ! incorrect flag.
Flags are optional and never count as a win by themselves.`;
export function parseCommand(line, rows, columns) {
  if (typeof line !== 'string') throw new TypeError('Input must be text.');
  const tokens = line.trim().split(/\s+/);
  if (!tokens[0]) return { type: 'empty' };
  const verb = tokens[0].toLowerCase();
  if (['help', 'quit', 'board', 'status'].includes(verb) && tokens.length === 1) return { type: verb };
  if (tokens.length === 1) return { type: 'open', position: parseCoordinate(tokens[0], rows, columns) };
  if (tokens.length === 2 && ['open', 'reveal', 'r', 'flag', 'f'].includes(verb)) {
    return { type: ['flag', 'f'].includes(verb) ? 'flag' : 'open', position: parseCoordinate(tokens[1], rows, columns) };
  }
  throw new RangeError('Use open A1, flag A1, board, status, help, or quit.');
}
export function progressText(state) {
  const p = getProgress(state);
  return `Safe cells: ${p.revealedSafe}/${p.totalSafe}. Flags: ${p.flags}. Mines: ${p.mines}.`;
}
export function renderBoard(state, countAdjacentMines) {
  assertState(state);
  const rows = state.mines.length, columns = state.mines[0].length;
  if (columns > 26) throw new RangeError('Terminal rendering supports at most 26 columns.');
  const gutter = String(rows).length;
  const lines = [`${' '.repeat(gutter + 2)}${Array.from({ length: columns }, (_, i) => String.fromCharCode(65 + i)).join(' ')}`];
  for (let r = 0; r < rows; r++) {
    const cells = [];
    for (let c = 0; c < columns; c++) {
      const mine = state.mines[r][c], flag = state.flagged[r][c], revealed = state.revealed[r][c];
      let symbol = '#';
      if (state.status !== 'playing' && mine) {
        symbol = state.exploded?.[0] === r && state.exploded?.[1] === c ? 'X' : flag ? 'F' : '*';
      } else if (state.status !== 'playing' && flag && !mine) symbol = '!';
      else if (flag) symbol = 'F';
      else if (revealed) symbol = String(countAdjacentMines(state.mines, r, c) || '.');
      cells.push(symbol);
    }
    lines.push(`${String(r + 1).padStart(gutter)}  ${cells.join(' ')}`);
  }
  return lines.join('\n');
}
