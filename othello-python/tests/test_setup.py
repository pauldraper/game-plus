from dataclasses import FrozenInstanceError
from pathlib import Path
from tempfile import TemporaryDirectory
import json
from typing import Any, cast
import unittest
from src.model import (
    Move,
    State,
    assert_player,
    assert_board,
    assert_move,
    assert_state,
    clone_board,
    create_initial_board,
    other_player,
)
from src.state import create_game, load_position, result_for
from src.ui import parse_move, parse_command, format_move, render_board
from src.implementation import load_implementation
from tests.support import cli, empty_board


class SetupTests(unittest.TestCase):
    def test_opening_orientation(self):
        board = create_initial_board()
        self.assertEqual(len(board), 8)
        self.assertTrue(all(len(row) == 8 for row in board))
        self.assertEqual(
            [board[3][3], board[3][4], board[4][3], board[4][4]], ["W", "B", "B", "W"]
        )
        self.assertEqual(sum(row.count(".") for row in board), 60)

    def test_initial_rows_and_games_are_independent(self):
        board = create_initial_board()
        board[0][0] = "B"
        self.assertEqual(board[1][0], ".")
        self.assertEqual(create_initial_board()[0][0], ".")
        self.assertEqual(len({id(row) for row in board}), 8)

    def test_clone_has_independent_rows(self):
        a = create_initial_board()
        b = clone_board(a)
        self.assertEqual(a, b)
        b[3][3] = "B"
        self.assertEqual(a[3][3], "W")
        for old, new in zip(a, b):
            self.assertIsNot(old, new)

    def test_game_initial_state(self):
        state = create_game()
        self.assertEqual((state.player, state.status), ("B", "playing"))
        self.assertEqual(state.board, create_initial_board())

    def test_result_for_active_state_does_not_count(self):
        def unavailable(board):
            raise AssertionError("No counting needed for active game")

        self.assertIsNone(result_for(create_game(), unavailable))

    def test_result_adapter_respects_counts_and_ties(self):
        ended = State(empty_board(), "B", "finished")
        for b, w, winner in [(33, 31, "B"), (2, 60, "W"), (1, 1, None)]:
            with self.subTest(b=b, w=w):
                result = result_for(
                    ended, lambda board: {"black": b, "white": w, "empty": 64 - b - w}
                )
                assert result is not None
                self.assertEqual(result["winner"], winner)
                self.assertEqual(result["draw"], winner is None)

    def test_player_validation(self):
        self.assertEqual(other_player("B"), "W")
        self.assertEqual(other_player("W"), "B")
        for value in (None, "X", [], 0):
            with self.subTest(value=value), self.assertRaises(TypeError):
                # Any deliberately bypasses static types to test runtime validation.
                assert_player(cast(Any, value))

    def test_board_validation(self):
        for board in ([], None, [["."] * 7 for _ in range(8)], ["........"] * 8):
            with self.subTest(board=board), self.assertRaises(TypeError):
                assert_board(cast(Any, board))
        for value in (None, "X", True, []):
            board = empty_board()
            cast(Any, board)[0][0] = value
            with self.subTest(value=value), self.assertRaises(TypeError):
                assert_board(board)

    def test_move_validation(self):
        for move in (
            None,
            (0, 0),
            {"row": 0, "col": 0},
            Move(True, 0),
            Move(cast(Any, 1.5), 0),
        ):
            with self.subTest(move=move), self.assertRaises(TypeError):
                assert_move(cast(Any, move))
        for move in (Move(-1, 0), Move(8, 0), Move(0, 8)):
            with self.subTest(move=move), self.assertRaises(ValueError):
                assert_move(move)

    def test_state_validation(self):
        for state in (
            None,
            {},
            State(empty_board(), cast(Any, "X")),
            State(empty_board(), "B", cast(Any, "unknown")),
        ):
            with self.subTest(state=state), self.assertRaises(TypeError):
                assert_state(cast(Any, state))

    def test_frozen_metadata(self):
        with self.assertRaises(FrozenInstanceError):
            setattr(create_game(), "player", "W")

    def test_coordinate_parser(self):
        self.assertEqual(parse_move("  d3  "), Move(2, 3))
        self.assertEqual(parse_move("H8"), Move(7, 7))

    def test_coordinate_round_trip(self):
        for row in range(8):
            for col in range(8):
                move = Move(row, col)
                self.assertEqual(parse_move(format_move(move)), move)

    def test_bad_coordinate_text(self):
        for text in ("", "A", "A0", "A9", "I1", "A10", "D 3", "D3extra", "A١"):
            with self.subTest(text=text), self.assertRaises(ValueError):
                parse_move(text)

    def test_commands(self):
        self.assertEqual(parse_command(" PASS "), ("pass", None))
        self.assertEqual(parse_command(""), ("empty", None))
        self.assertEqual(parse_command("d3"), ("move", Move(2, 3)))

    def test_renderer(self):
        text = render_board(create_initial_board())
        self.assertIn("A B C D E F G H", text)
        self.assertIn("4  . . . W B . . .", text)
        self.assertEqual(len(text.splitlines()), 9)

    def test_load_json_position(self):
        with TemporaryDirectory() as folder:
            path = Path(folder) / "position with spaces.json"
            path.write_text(
                json.dumps(
                    {
                        "board": create_initial_board(),
                        "player": "W",
                        "status": "playing",
                    }
                )
            )
            state = load_position(path)
            self.assertEqual(state.player, "W")
            self.assertEqual(state.board, create_initial_board())

    def test_reject_invalid_json_position(self):
        with TemporaryDirectory() as folder:
            path = Path(folder) / "bad.json"
            for value in (
                [],
                {},
                {"board": []},
                {"board": empty_board(), "status": "bad"},
            ):
                path.write_text(json.dumps(value))
                with self.subTest(value=value), self.assertRaises(TypeError):
                    load_position(path)

    def test_unknown_implementation_rejected(self):
        with self.assertRaises(ValueError):
            load_implementation("unknown")

    def test_shell_help_argument(self):
        result = cli(args=("--help",))
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("usage:", result.stdout)

    def test_shell_start_help_quit(self):
        result = cli("help\nquit\n")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("Turn: B", result.stdout)
        self.assertIn("Commands:", result.stdout)
        self.assertIn("Session ended.", result.stdout)

    def test_shell_board_without_rules(self):
        result = cli("board\nquit\n")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stdout.count("A B C D E F G H"), 2)

    def test_shell_invalid_input_then_help(self):
        result = cli("J9\nhelp\nquit\n")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("Invalid move:", result.stdout)
        self.assertIn("Commands:", result.stdout)

    def test_shell_blank_and_eof(self):
        result = cli("\n")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("end of input", result.stdout)

    def test_shell_unknown_option(self):
        result = cli(args=("--unknown",))
        self.assertEqual(result.returncode, 2)
        self.assertIn("usage:", result.stderr)

    def test_shell_missing_position(self):
        result = cli(args=("--position", "scenarios/missing.json"))
        self.assertEqual(result.returncode, 1)
        self.assertIn("Configuration error:", result.stderr)

    def test_shell_position_without_rule_calls(self):
        result = cli("quit\n", ("--position", "scenarios/forced-pass.json"))
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("1  . B W B B B B B", result.stdout)
