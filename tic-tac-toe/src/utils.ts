import { Player, InvalidMoveError, NotImplementedError } from './game';

/** A cell is empty or contains the player who marked it. */
export type CellState = Player | null;
/** A square board addressed as `state[row][column]`, starting at zero. */
export type State = CellState[][];
/** Zero-based `[row, column]` coordinates; console input B3 becomes `[2, 1]`. */
export type Move = [number, number];

/**
 * Creates an empty square board with independent row arrays.
 * @param boardSize - Expected to be a positive integer; not validated here.
 */
export function createBoard(boardSize: number): State {
  return Array.from({ length: boardSize }, () => Array(boardSize).fill(null));
}

/**
 * Checks that coordinates are integers within the board.
 * This checks location only, not whether the cell is occupied.
 */
export function isInsideBoard(row: number, column: number, boardSize: number): boolean {
  return (
    Number.isInteger(row) &&
    Number.isInteger(column) &&
    row >= 0 &&
    row < boardSize &&
    column >= 0 &&
    column < boardSize
  );
}

/**
 * Generates all full-board winning lines for a square board.
 *
 * @param boardSize - Expected positive integer side length.
 * @returns Rows and columns followed by the two diagonals; every line contains
 * `boardSize` coordinates. A 3-by-3 board has eight lines. For size one,
 * the row, column, and diagonals all describe the same cell.
 * This implements a full-line win, rather than a shorter run within a larger board.
 */
export function createWinningLines(boardSize: number): Move[][] {
  const lines: Move[][] = [];
  const descendingDiagonal: Move[] = [];
  const ascendingDiagonal: Move[] = [];
  for (let index = 0; index < boardSize; index++) {
    const rowLine: Move[] = [];
    const columnLine: Move[] = [];
    for (let position = 0; position < boardSize; position++) {
      // A row fixes the first coordinate; a column fixes the second.
      rowLine.push([index, position]);
      columnLine.push([position, index]);
    }
    lines.push(rowLine, columnLine);
    descendingDiagonal.push([index, index]);
    // Mirroring the column visits the diagonal from top-right to bottom-left.
    ascendingDiagonal.push([index, boardSize - 1 - index]);
  }
  if (boardSize > 0) {
    lines.push(descendingDiagonal, ascendingDiagonal);
  }
  return lines;
}

/**
 * Finds the first completed line's player, or `null` when neither player wins.
 * @param state - Square board matching the size used to generate the lines.
 * @param winningLines - Nonempty lines of valid board coordinates.
 * Positions are assumed to be reachable through play; if both players have
 * winning lines, the first line in the supplied order determines the result.
 */
export function getWinner(state: State, winningLines: Move[][]): Player | null {
  // TODO: Identify a player whose marks fill a supplied winning line.
  throw new NotImplementedError('getWinner');
}

/** Counts marks so scoring can favor earlier wins. */
export function countOccupiedCells(state: State): number {
  let occupiedCells = 0;
  for (const row of state) {
    for (const cell of row) {
      if (cell !== null) {
        occupiedCells++;
      }
    }
  }
  return occupiedCells;
}

/** Reports whether there are no empty cells; a full board can still have a winner. */
export function isBoardFull(state: State): boolean {
  return state.every((row) => row.every((cell) => cell !== null));
}

/**
 * Copies the outer array and each row, so a successor can be changed independently.
 * Cells are numbers or null, so no deeper cloning is needed.
 */
export function copyState(state: State): State {
  return state.map((row) => [...row]);
}

/** Returns X for MAX, O for MIN, or a space for an empty cell. */
export function renderCell(cell: CellState): string {
  switch (cell) {
    case Player.MAX:
      return 'X';
    case Player.MIN:
      return 'O';
    default:
      return ' ';
  }
}

/**
 * Renders a numbered row with cell separators.
 * @param rowIndex - Zero-based row index, displayed as a one-based number.
 * @param labelWidth - Padding shared by all row labels to align the grid.
 */
export function renderRow(row: CellState[], rowIndex: number, labelWidth: number): string {
  const label = String(rowIndex + 1).padStart(labelWidth);
  return ` ${label} | ${row.map(renderCell).join(' | ')} |`;
}

/**
 * Returns a multiline square board with lettered columns and numbered rows.
 * Console labels support sizes 1 through 26 (A through Z).
 * Formatting does not change the board or write to the console.
 */
export function renderBoard(state: State): string {
  const boardSize = state.length;
  const labelWidth = String(boardSize).length;
  // Reserve enough room for the largest row number, including multiple digits.
  const columnLabels = Array.from({ length: boardSize }, (_, column) =>
    String.fromCharCode('A'.charCodeAt(0) + column),
  );
  const heading = ' '.repeat(labelWidth + 4) + columnLabels.join('   ');
  const separator = ' '.repeat(labelWidth + 2) + '-'.repeat(boardSize * 4 + 1);
  const lines = [heading, separator];
  state.forEach((row, rowIndex) => {
    lines.push(renderRow(row, rowIndex, labelWidth), separator);
  });
  return lines.join('\n');
}

/**
 * Parses an uppercase column letter and a one-based row number.
 * Surrounding whitespace is ignored; B3 maps to `[2, 1]`.
 * @param boardSize - Board side length; console labels support 1 through 26.
 * @throws When syntax is invalid or the coordinates fall outside the board.
 * Occupancy is not checked because no board state is supplied.
 */
export function parseMove(input: string, boardSize: number): Move {
  const match = /^([A-Z])(\d+)$/.exec(input.trim());
  if (!match) {
    throw new InvalidMoveError('Use a column letter followed by a row number, such as A1');
  }
  const column = match[1].charCodeAt(0) - 'A'.charCodeAt(0);
  const row = Number(match[2]) - 1;
  if (!isInsideBoard(row, column, boardSize)) {
    throw new InvalidMoveError('Move out of bounds');
  }
  return [row, column];
}

/**
 * Converts valid integer coordinates into console input, such as `[2, 1]` to B3.
 * Coordinates are assumed valid; column indices 0 through 25 produce A through Z.
 */
export function serializeMove([row, column]: Move): string {
  return String.fromCharCode('A'.charCodeAt(0) + column) + String(row + 1);
}
