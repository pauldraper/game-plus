"""CHALLENGE: complete four functions. Keep signatures and validation intact.

Read docs/CHALLENGE.md. Only this file and src/game.py need editing.
The example is separate; it is never used as a fallback for unfinished code.
"""

from src.model import (
    Board,
    Player,
    Move,
    Counts,
    assert_board,
    assert_player,
    assert_move,
    MissingImplementationError,
)


def get_flips(board: Board, player: Player, move: Move) -> list[Move]:
    """Return captured coordinates; order does not matter; no duplicates.

    Return [] for an occupied square or a move with no captures. Do not mutate.
    """
    assert_board(board)
    assert_player(player)
    assert_move(move)
    # TODO 1
    raise MissingImplementationError("get_flips")


def get_legal_moves(board: Board, player: Player) -> list[Move]:
    """Return all legal moves in row-major order without changing board."""
    assert_board(board)
    assert_player(player)
    # TODO 2
    raise MissingImplementationError("get_legal_moves")


def apply_move(board: Board, player: Player, move: Move) -> Board:
    """Place and capture on an independent board; copy every row.

    Raise InvalidMoveError for an occupied square or an action with no captures.
    """
    assert_board(board)
    assert_player(player)
    assert_move(move)
    # TODO 3
    raise MissingImplementationError("apply_move")


def count_discs(board: Board) -> Counts:
    """Return a dict with black, white, and empty counts totaling 64."""
    assert_board(board)
    # TODO 4
    raise MissingImplementationError("count_discs")
