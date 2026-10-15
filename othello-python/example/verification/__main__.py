"""Run independent, deterministic example checks: python3 -m example.verification."""

from copy import deepcopy
import json
from pathlib import Path
import random
import subprocess
import sys
from example.src import rules, game
from src.model import BLACK, WHITE, Move, State, InvalidMoveError
from src.state import create_game
from src.ui import format_move
from .oracle import capture_map, after_move

ROOT = Path(__file__).resolve().parents[2]


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def main():
    rng = random.Random(20261014)
    report = {
        "seed": 20261014,
        "random_boards": 128,
        "capture_comparisons": 0,
        "applied_move_comparisons": 0,
        "complete_games": 200,
        "game_transitions": 0,
        "explicit_passes": 0,
        "cli_replays": 0,
    }
    for _ in range(report["random_boards"]):
        board = [[rng.choice("BW..") for _ in range(8)] for _ in range(8)]
        old = deepcopy(board)
        for player in (BLACK, WHITE):
            expected = capture_map(board, player)
            actual = rules.get_legal_moves(board, player)
            require(
                [(m.row, m.col) for m in actual] == sorted(expected),
                "Legal moves or order differ",
            )
            for row in range(8):
                for col in range(8):
                    move = Move(row, col)
                    flips = rules.get_flips(board, player, move)
                    found = [(p.row, p.col) for p in flips]
                    require(len(found) == len(set(found)), "Duplicate captures")
                    require(
                        set(found) == expected.get((row, col), set()),
                        "Capture mismatch",
                    )
                    report["capture_comparisons"] += 1
                    if (row, col) in expected:
                        changed = rules.apply_move(board, player, move)
                        require(
                            changed
                            == after_move(
                                board, player, (row, col), expected[(row, col)]
                            ),
                            "Apply mismatch",
                        )
                        require(
                            all(new is not old for new in changed for old in board),
                            "Board alias",
                        )
                        report["applied_move_comparisons"] += 1
                    else:
                        try:
                            rules.apply_move(board, player, move)
                        except InvalidMoveError:
                            pass
                        else:
                            raise AssertionError("Illegal action accepted")
            require(board == old, "Input board mutated")

    replay_cases = []
    for game_number in range(report["complete_games"]):
        state = create_game()
        commands = []
        for step in range(130):
            before = deepcopy(state)
            player = state.player
            opponent = "W" if player == "B" else "B"
            possible = capture_map(state.board, player)
            require(
                [(m.row, m.col) for m in rules.get_legal_moves(state.board, player)]
                == sorted(possible),
                "Move map mismatch",
            )
            if possible:
                key = rng.choice(sorted(possible))
                expected_board = after_move(state.board, player, key, possible[key])
                finished = not capture_map(expected_board, player) and not capture_map(
                    expected_board, opponent
                )
                expected = State(
                    expected_board, opponent, "finished" if finished else "playing"
                )
                command = format_move(Move(*key))
                new_state = game.play_move(state, Move(*key))
            else:
                resumes = bool(capture_map(state.board, opponent))
                expected = State(
                    deepcopy(state.board),
                    opponent if resumes else player,
                    "playing" if resumes else "finished",
                )
                new_state = game.pass_turn(state)
                command = "pass"
                report["explicit_passes"] += 1
            commands.append(command)
            require(new_state == expected, "Lifecycle mismatch")
            require(state == before, "Input state mutated")
            require(
                all(a is not b for a in state.board for b in new_state.board),
                "State board alias",
            )
            state = new_state
            report["game_transitions"] += 1
            flat = sum(state.board, [])
            counts = {
                "black": flat.count("B"),
                "white": flat.count("W"),
                "empty": flat.count("."),
            }
            require(rules.count_discs(state.board) == counts, "Disc counts differ")
            if state.status == "finished":
                result = game.get_result(state)
                winner = (
                    "B"
                    if counts["black"] > counts["white"]
                    else "W"
                    if counts["white"] > counts["black"]
                    else None
                )
                require(
                    result == {**counts, "winner": winner, "draw": winner is None},
                    "Result mismatch",
                )
                for action in (
                    lambda: game.pass_turn(state),
                    lambda: game.play_move(state, Move(0, 0)),
                ):
                    try:
                        action()
                    except InvalidMoveError:
                        pass
                    else:
                        raise AssertionError("Action accepted after game ended")
                if game_number < 8:
                    replay_cases.append((commands, result))
                break
        else:
            raise AssertionError("Game did not terminate")

    for commands, result in replay_cases:
        completed = subprocess.run(
            [sys.executable, "-m", "example"],
            input="\n".join(commands) + "\n",
            text=True,
            capture_output=True,
            cwd=ROOT,
            timeout=12,
        )
        require(completed.returncode == 0, completed.stderr)
        require(
            f"Final score: B {result['black']}, W {result['white']}, empty {result['empty']}"
            in completed.stdout,
            "CLI result mismatch",
        )
        require(
            "Not implemented" not in completed.stdout
            and "Invalid move:" not in completed.stdout,
            "CLI failed a valid replay",
        )
        report["cli_replays"] += 1
    print(json.dumps(report, indent=2))
    print("Independent example verification passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
