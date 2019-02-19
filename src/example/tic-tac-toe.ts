import { Player, Game } from '../game';
import { ConsoleGame } from '../console';

export type CellState = Player | null;

export type State = CellState[][];

export type Move = [number, number];

const SIZE = 3;

export function initialState(): State {
  return Array(SIZE)
    .fill(undefined)
    .map(() => Array(SIZE).fill(null));
}

export const game: Game<State, Move> = {
  move(state: State, [row, column]: Move, player: Player) {
    if (row < 0 || SIZE <= row) {
      throw new Error('Row out of bounds');
    }
    if (column < 0 || SIZE <= column) {
      throw new Error('Column out of bounds');
    }
    if (state[row][column] !== null) {
      throw new Error('Cell occupied');
    }
    state = copyState(state);
    state[row][column] = player;
    return state;
  },

  moves(state: State) {
    if (this.score(state)) {
      return [];
    }

    const moves: Move[] = [];
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE; j++) {
        if (state[i][j] === null) {
          moves.push([i, j]);
        }
      }
    }
    return moves;
  },

  score(state: State) {
    let turns = 0;
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE; j++) {
        turns += +(state[i][j] !== null);
      }
    }

    for (let di = 0; di <= 1; di++) {
      for (let dj = 0; dj <= 1; dj++) {
        if (di === 0 && dj === 0) {
          continue;
        }
        for (let i = 0; i < (di || SIZE); i++) {
          for (let j = 0; j < (dj || SIZE); j++) {
            const cells = Array(SIZE)
              .fill(undefined)
              .map((_, n) => state[i + di * n][j + dj * n]);
            if (cells.every(cell => cell === Player.MAX)) {
              return 1 / turns;
            }
            if (cells.every(cell => cell === Player.MIN)) {
              return -1 / turns;
            }
          }
        }
      }
    }

    return 0;
  },
};

export const interactiveGame: ConsoleGame<State, Move> = {
  game,

  initial() {
    return { state: initialState(), player: Player.MAX };
  },

  parseMove(input: string) {
    const [y, x] = input;
    return [x.charCodeAt(0) - '1'.charCodeAt(0), y.charCodeAt(0) - 'A'.charCodeAt(0)];
  },

  print(state: State) {
    let result = '     ';
    result += ['A', 'B', 'C'].join('   ');
    result += '\n';
    result += '   ';
    result += '-'.repeat(13);
    for (let i = 0; i < SIZE; i++) {
      result += '\n';
      result += ` ${i + 1} | `;
      result += Array(SIZE)
        .fill(undefined)
        .map((_, j) => {
          switch (state[i][j]) {
            case Player.MAX:
              return 'X';
            case Player.MIN:
              return 'O';
            default:
              return ' ';
          }
        })
        .join(' | ');
      result += ' |';
      result += '\n';
      result += '   ';
      result += '-'.repeat(13);
    }
    return result;
  },

  serializeMove([row, column]: Move) {
    return (
      String.fromCharCode('A'.charCodeAt(0) + column) + String.fromCharCode('1'.charCodeAt(0) + row)
    );
  },
};

function copyState(state: State) {
  return state.map(row => [...row]);
}
