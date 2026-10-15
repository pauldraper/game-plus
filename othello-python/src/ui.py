"""Supplied terminal parsing and board presentation; no game-rule solution."""
import re
from .model import Board, Move, InvalidMoveError, assert_board, assert_move

HELP = """Commands:
  D3       Place a disc at column D, row 3 (case-insensitive).
  moves    List legal moves.
  score    Show black, white, and empty counts.
  board    Show the board.
  pass     Pass only when no legal move exists.
  help     Show commands.
  quit     End the session.
"""


def parse_move(text: str) -> Move:
    if not isinstance(text, str):
        raise TypeError("Input must be text.")
    match = re.fullmatch(r"([A-Ha-h])([1-8])", text.strip())
    if match is None:
        raise InvalidMoveError("Use coordinates such as D3, from A1 through H8.")
    return Move(int(match[2]) - 1, ord(match[1].upper()) - ord("A"))


def format_move(move: Move) -> str:
    assert_move(move)
    return f"{chr(ord('A') + move.col)}{move.row + 1}"


def parse_command(text: str) -> tuple[str, Move | None]:
    if not isinstance(text, str):
        raise TypeError("Input must be text.")
    value = text.strip().lower()
    if not value:
        return ("empty", None)
    if value in ("moves", "score", "board", "pass", "help", "quit"):
        return (value, None)
    return ("move", parse_move(text))


def render_board(board: Board) -> str:
    assert_board(board)
    return "    A B C D E F G H\n" + "\n".join(
        f" {i + 1}  {' '.join(row)}" for i, row in enumerate(board)
    )
