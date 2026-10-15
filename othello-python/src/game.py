"""CHALLENGE: complete two lifecycle functions; initialization/results supplied."""

from src.model import (
    State,
    Move,
    Result,
    assert_state,
    assert_move,
    MissingImplementationError,
)
from src.rules import count_discs
from src.state import result_for


def play_move(state: State, move: Move) -> State:
    """Reject finished games, apply a move, and switch to the other player.

    Finish if neither side can move. Otherwise retain 'playing', even when the
    next player must explicitly pass. Switch players even on a terminal move.
    Return an independent State and board; never change the input.
    """
    assert_state(state)
    assert_move(move)
    # TODO 5
    raise MissingImplementationError("play_move")


def pass_turn(state: State) -> State:
    """Reject finished games and passes while a legal move exists.

    If the opponent can move, switch players. If neither can move, finish and
    retain the current player. Return an independent board even on a pass.
    """
    assert_state(state)
    # TODO 6
    raise MissingImplementationError("pass_turn")


def get_result(state: State) -> Result | None:
    """Supplied result adapter; uses your count_discs only for finished games."""
    return result_for(state, count_discs)
