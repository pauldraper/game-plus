"""Supplied game initialization, result formatting, and scenario loading."""
import json
from pathlib import Path
from typing import Callable
from .model import (
    BLACK, WHITE, Board, Counts, Result, State, assert_state, clone_board,
    create_initial_board,
)


def create_game() -> State:
    return State(create_initial_board())


def result_for(state: State, counter: Callable[[Board], Counts]) -> Result | None:
    assert_state(state)
    if state.status != "finished":
        return None
    counts = counter(state.board)
    winner = BLACK if counts["black"] > counts["white"] else (
        WHITE if counts["white"] > counts["black"] else None
    )
    return {**counts, "winner": winner, "draw": winner is None}


def load_position(filename: str | Path) -> State:
    """Read the same board/player/status JSON shape as the JavaScript challenge.

    Schema is validated, not historical reachability or terminal metadata truth.
    """
    data = json.loads(Path(filename).read_text(encoding="utf-8"))
    if not isinstance(data, dict) or "board" not in data:
        raise TypeError("Position JSON must contain a board.")
    state = State(data["board"], data.get("player", BLACK), data.get("status", "playing"))
    assert_state(state)
    return State(clone_board(state.board), state.player, state.status)
