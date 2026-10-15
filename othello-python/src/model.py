"""Supplied data types, validation, and copying helpers. No capture rules."""
from dataclasses import dataclass
from typing import Literal, TypedDict

SIZE = 8
BLACK = "B"
WHITE = "W"
EMPTY = "."
Player = Literal["B", "W"]
Status = Literal["playing", "finished"]
Board = list[list[str]]

@dataclass(frozen=True)
class Move:
    """Zero-based row and column; CLI labels such as D3 are parsed separately."""
    row: int
    col: int

@dataclass(frozen=True)
class State:
    """Frozen metadata does NOT make the nested board immutable. Copy its rows."""
    board: Board
    player: Player = BLACK
    status: Status = "playing"

class Counts(TypedDict):
    black: int
    white: int
    empty: int

class Result(Counts):
    winner: Player | None
    draw: bool

class InvalidMoveError(ValueError):
    """Well-formed input that is not a legal game action."""

class MissingImplementationError(NotImplementedError):
    """A practice stub has not been completed yet."""

    def __init__(self, function: str):
        super().__init__(f"Not implemented: {function}")


def assert_player(player: Player) -> None:
    if type(player) is not str or player not in (BLACK, WHITE):
        raise TypeError("Player must be 'B' or 'W'.")


def assert_board(board: Board) -> None:
    if type(board) is not list or len(board) != SIZE:
        raise TypeError("Board must be an 8 by 8 list of lists.")
    for row in board:
        if type(row) is not list or len(row) != SIZE:
            raise TypeError("Every board row must contain eight cells.")
        if any(type(cell) is not str or cell not in (BLACK, WHITE, EMPTY) for cell in row):
            raise TypeError("Cells must be 'B', 'W', or '.'.")


def assert_move(move: Move) -> None:
    if not isinstance(move, Move):
        raise TypeError("Move must be a Move(row, col).")
    # bool is a subclass of int in Python; it is not a valid coordinate here.
    if type(move.row) is not int or type(move.col) is not int:
        raise TypeError("Coordinates must be integers, not booleans or fractions.")
    if not (0 <= move.row < SIZE and 0 <= move.col < SIZE):
        raise ValueError("Coordinates must be between 0 and 7.")


def assert_state(state: State) -> None:
    if not isinstance(state, State):
        raise TypeError("State must be a State instance.")
    assert_board(state.board)
    assert_player(state.player)
    if type(state.status) is not str or state.status not in ("playing", "finished"):
        raise TypeError("Status must be 'playing' or 'finished'.")


def other_player(player: Player) -> Player:
    assert_player(player)
    return WHITE if player == BLACK else BLACK


def clone_board(board: Board) -> Board:
    assert_board(board)
    return [row.copy() for row in board]


def create_initial_board() -> Board:
    board = [[EMPTY for _ in range(SIZE)] for _ in range(SIZE)]
    board[3][3] = board[4][4] = WHITE
    board[3][4] = board[4][3] = BLACK
    return board
