from pathlib import Path
import subprocess
import sys
from tests import selection
from src.implementation import load_implementation
from src.model import SIZE, State

ROOT = Path(__file__).resolve().parents[1]
TARGET = selection.TARGET
impl = load_implementation(TARGET)


def empty_board():
    return [["."] * SIZE for _ in range(SIZE)]


def rows(*values):
    return [list(row) for row in values]


def move_keys(moves):
    return sorted((move.row, move.col) for move in moves)


def forced_pass():
    return State(rows(".BWBBBBB", *(["BBBBBBBB"] * 7)))


def blocked():
    return State(rows(".BBBBBBB", *(["BBBBBBBB"] * 7)))


def last_draw():
    return State(rows(".WBBBBBB", *(["BBBBBBBB"] * 3), *(["WWWWWWWW"] * 4)))


def assert_isolated(case, before, after):
    case.assertIsNot(before, after)
    a = before.board if isinstance(before, State) else before
    b = after.board if isinstance(after, State) else after
    case.assertIsNot(a, b)
    for old_row in a:
        for new_row in b:
            case.assertIsNot(old_row, new_row)
    case.assertEqual(len({id(row) for row in b}), 8)


def cli(text="", args=(), target=None, env=None):
    selected = TARGET if target is None else target
    command = [
        sys.executable,
        "-m",
        "example" if selected == "example" else "src.cli",
        *args,
    ]
    return subprocess.run(
        command,
        cwd=ROOT,
        input=text,
        text=True,
        capture_output=True,
        timeout=8,
        env=env,
    )
