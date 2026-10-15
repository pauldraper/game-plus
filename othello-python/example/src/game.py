"""Completed lifecycle. Imports only example rules and supplied infrastructure."""

from src.model import (
    State,
    Move,
    Result,
    assert_state,
    assert_move,
    clone_board,
    other_player,
    InvalidMoveError,
)
from src.state import result_for
from .rules import apply_move, get_legal_moves, count_discs


def play_move(state: State, move: Move) -> State:
    assert_state(state)
    assert_move(move)
    if state.status == "finished":
        raise InvalidMoveError("Game is already finished.")
    board = apply_move(state.board, state.player, move)
    player = other_player(state.player)
    finished = not get_legal_moves(board, player) and not get_legal_moves(
        board, state.player
    )
    return State(board, player, "finished" if finished else "playing")


def pass_turn(state: State) -> State:
    assert_state(state)
    if state.status == "finished":
        raise InvalidMoveError("Game is already finished.")
    if get_legal_moves(state.board, state.player):
        raise InvalidMoveError("Cannot pass while a legal move exists.")
    opponent = other_player(state.player)
    can_continue = bool(get_legal_moves(state.board, opponent))
    return State(
        clone_board(state.board),
        opponent if can_continue else state.player,
        "playing" if can_continue else "finished",
    )


def get_result(state: State) -> Result | None:
    return result_for(state, count_discs)
