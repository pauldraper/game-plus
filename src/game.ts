export interface Actor<State, Move> {
  nextMove(state: State, player: Player): Promise<Move | null>;
}

export interface Game<State, Move> {
  move(state: State, move: Move, player: Player): State;
  moves(state: State, player: Player): Move[];
  score(state: State): Score;
}

export enum Player {
  MAX,
  MIN,
}

export type Score = number;
