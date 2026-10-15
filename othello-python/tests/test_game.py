from copy import deepcopy
from typing import Any, cast
import unittest
from src.model import Move, State, InvalidMoveError, create_initial_board
from src.state import create_game
from tests.support import impl, rows, blocked, forced_pass, last_draw, assert_isolated


class GameTests(unittest.TestCase):
    def test_move_switches_player(self):
        before = create_game()
        snapshot = deepcopy(before)
        after = impl.play_move(before, Move(2, 3))
        self.assertEqual((after.player, after.status), ("W", "playing"))
        self.assertEqual(after.board[2][3], "B")
        self.assertEqual(before, snapshot)
        assert_isolated(self, before, after)

    def test_illegal_move_does_not_consume_turn(self):
        before = create_game()
        snapshot = deepcopy(before)
        with self.assertRaises(InvalidMoveError):
            impl.play_move(before, Move(0, 0))
        self.assertEqual(before, snapshot)

    def test_explicit_pass_is_required(self):
        board = rows(".WBBBBBB", *(["BBBBBBBB"] * 6), "BBBBBBW.")
        after = impl.play_move(State(board), Move(0, 0))
        self.assertEqual((after.player, after.status), ("W", "playing"))
        self.assertEqual(impl.get_legal_moves(after.board, "W"), [])
        self.assertEqual(len(impl.get_legal_moves(after.board, "B")), 1)
        self.assertEqual(impl.pass_turn(after).player, "B")

    def test_pass_forbidden_when_moves_exist(self):
        with self.assertRaises(InvalidMoveError):
            impl.pass_turn(create_game())

    def test_forced_pass_copies_board(self):
        before = forced_pass()
        snapshot = deepcopy(before)
        after = impl.pass_turn(before)
        self.assertEqual((after.player, after.status), ("W", "playing"))
        self.assertEqual(after.board, before.board)
        self.assertEqual(before, snapshot)
        assert_isolated(self, before, after)

    def test_both_blocked_finishes_with_empty_cells(self):
        before = blocked()
        after = impl.pass_turn(before)
        self.assertEqual((after.player, after.status), ("B", "finished"))
        self.assertEqual(
            impl.get_result(after),
            {"black": 63, "white": 0, "empty": 1, "winner": "B", "draw": False},
        )
        assert_isolated(self, before, after)

    def test_final_move_draw_and_player_switch(self):
        after = impl.play_move(last_draw(), Move(0, 0))
        self.assertEqual((after.player, after.status), ("W", "finished"))
        self.assertEqual(
            impl.get_result(after),
            {"black": 32, "white": 32, "empty": 0, "winner": None, "draw": True},
        )

    def test_move_can_finish_before_full(self):
        state = State(rows(".WBBBBBB", *(["BBBBBBBB"] * 6), "BBBBBBB."))
        after = impl.play_move(state, Move(0, 0))
        self.assertEqual(after.status, "finished")
        self.assertEqual(impl.get_result(after)["empty"], 1)

    def test_white_winner(self):
        state = State(rows(".BWWWWWW", *(["WWWWWWWW"] * 7)), "W")
        after = impl.play_move(state, Move(0, 0))
        self.assertEqual(impl.get_result(after)["winner"], "W")
        self.assertEqual(impl.get_result(after)["white"], 64)

    def test_terminal_rejects_move(self):
        ended = State(create_initial_board(), "B", "finished")
        with self.assertRaises(InvalidMoveError):
            impl.play_move(ended, Move(2, 3))

    def test_terminal_rejects_pass(self):
        ended = State(create_initial_board(), "B", "finished")
        with self.assertRaises(InvalidMoveError):
            impl.pass_turn(ended)

    def test_active_result_none(self):
        self.assertIsNone(impl.get_result(create_game()))

    def test_invalid_state_rejected(self):
        # Deliberately invalid metadata exercises runtime validation.
        bad = State(create_initial_board(), "B", cast(Any, "unknown"))
        for fn, args in ((impl.play_move, (bad, Move(2, 3))), (impl.pass_turn, (bad,))):
            with self.assertRaises(TypeError):
                fn(*args)

    def test_illegal_pass_preserves_state(self):
        before = create_game()
        snapshot = deepcopy(before)
        with self.assertRaises(InvalidMoveError):
            impl.pass_turn(before)
        self.assertEqual(before, snapshot)
