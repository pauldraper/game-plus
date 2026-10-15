from copy import deepcopy
from typing import Any, cast
import unittest
from src.model import Move, InvalidMoveError, create_initial_board
from tests.support import impl, empty_board, rows, move_keys, assert_isolated


class RulesTests(unittest.TestCase):
    def test_multiple_opponents_in_line(self):
        board = empty_board()
        board[2] = list(".WWWB...")
        self.assertEqual(
            move_keys(impl.get_flips(board, "B", Move(2, 0))), [(2, 1), (2, 2), (2, 3)]
        )

    def test_all_directions_no_duplicates(self):
        board = empty_board()
        expected = []
        for dr in (-1, 0, 1):
            for dc in (-1, 0, 1):
                if dr == dc == 0:
                    continue
                board[3 + dr][3 + dc] = "W"
                board[3 + 2 * dr][3 + 2 * dc] = "B"
                expected.append(Move(3 + dr, 3 + dc))
        flips = impl.get_flips(board, "B", Move(3, 3))
        self.assertEqual(move_keys(flips), move_keys(expected))
        self.assertEqual(len(flips), len(set(flips)))

    def test_white_symmetry(self):
        self.assertEqual(
            impl.get_flips(create_initial_board(), "W", Move(2, 4)), [Move(3, 4)]
        )

    def test_occupied_square(self):
        board = create_initial_board()
        self.assertEqual(impl.get_flips(board, "B", Move(3, 3)), [])
        self.assertEqual(impl.get_flips(board, "B", Move(3, 4)), [])

    def test_empty_gap(self):
        board = empty_board()
        board[0] = list(".W.B....")
        self.assertEqual(impl.get_flips(board, "B", Move(0, 0)), [])

    def test_adjacent_friendly_disc(self):
        board = empty_board()
        board[0] = list(".BWB....")
        self.assertEqual(impl.get_flips(board, "B", Move(0, 0)), [])

    def test_unbounded_opponents(self):
        board = empty_board()
        board[0] = list(".WWWWWWW")
        self.assertEqual(impl.get_flips(board, "B", Move(0, 0)), [])

    def test_edge_does_not_wrap(self):
        board = empty_board()
        board[4][0] = "W"
        board[4][1] = "B"
        self.assertEqual(impl.get_flips(board, "B", Move(3, 7)), [])

    def test_corner_capture(self):
        board = empty_board()
        board[0][1] = board[1][1] = "W"
        board[0][2] = board[2][2] = "B"
        self.assertEqual(
            move_keys(impl.get_flips(board, "B", Move(0, 0))), [(0, 1), (1, 1)]
        )

    def test_queries_preserve_input(self):
        board = create_initial_board()
        snapshot = deepcopy(board)
        impl.get_flips(board, "B", Move(2, 3))
        impl.get_legal_moves(board, "B")
        impl.count_discs(board)
        self.assertEqual(board, snapshot)

    def test_black_opening_moves_order(self):
        self.assertEqual(
            impl.get_legal_moves(create_initial_board(), "B"),
            [Move(2, 3), Move(3, 2), Move(4, 5), Move(5, 4)],
        )

    def test_white_opening_moves_order(self):
        self.assertEqual(
            impl.get_legal_moves(create_initial_board(), "W"),
            [Move(2, 4), Move(3, 5), Move(4, 2), Move(5, 3)],
        )

    def test_no_moves_empty_board(self):
        self.assertEqual(impl.get_legal_moves(empty_board(), "B"), [])

    def test_no_moves_full_board(self):
        self.assertEqual(impl.get_legal_moves(rows(*(["BBBBBBBB"] * 8)), "W"), [])

    def test_moves_list_is_fresh(self):
        board = create_initial_board()
        moves = impl.get_legal_moves(board, "B")
        self.assertEqual(len(moves), 4)
        moves.clear()
        self.assertEqual(len(impl.get_legal_moves(board, "B")), 4)

    def test_apply_black_places_and_flips(self):
        board = create_initial_board()
        snapshot = deepcopy(board)
        after = impl.apply_move(board, "B", Move(2, 3))
        expected = create_initial_board()
        expected[2][3] = expected[3][3] = "B"
        self.assertEqual(after, expected)
        self.assertEqual(board, snapshot)
        assert_isolated(self, board, after)

    def test_apply_white_and_count(self):
        after = impl.apply_move(create_initial_board(), "W", Move(2, 4))
        self.assertEqual(after[2][4], "W")
        self.assertEqual(impl.count_discs(after), {"black": 1, "white": 4, "empty": 59})

    def test_no_chain_captures(self):
        board = empty_board()
        board[3][2] = board[2][2] = "W"
        board[3][3] = board[1][2] = "B"
        after = impl.apply_move(board, "B", Move(3, 1))
        self.assertEqual(after[3][2], "B")
        self.assertEqual(after[2][2], "W")

    def test_illegal_apply_preserves_board(self):
        board = create_initial_board()
        snapshot = deepcopy(board)
        for move in (Move(0, 0), Move(3, 3)):
            with self.assertRaises(InvalidMoveError):
                impl.apply_move(board, "B", move)
            self.assertEqual(board, snapshot)

    def test_counts_opening(self):
        self.assertEqual(
            impl.count_discs(create_initial_board()),
            {"black": 2, "white": 2, "empty": 60},
        )

    def test_counts_empty(self):
        self.assertEqual(
            impl.count_discs(empty_board()), {"black": 0, "white": 0, "empty": 64}
        )

    def test_counts_full(self):
        self.assertEqual(
            impl.count_discs(rows(*(["WWWWWWWW"] * 8))),
            {"black": 0, "white": 64, "empty": 0},
        )

    def test_public_move_validation(self):
        for fn in (impl.get_flips, impl.apply_move):
            # The fractional coordinate intentionally bypasses static types.
            for move in (None, Move(True, 0), Move(0, False), Move(cast(Any, 1.5), 0)):
                with (
                    self.subTest(fn=fn.__name__, move=move),
                    self.assertRaises(TypeError),
                ):
                    fn(create_initial_board(), "B", move)
            with self.assertRaises(ValueError):
                fn(create_initial_board(), "B", Move(8, 0))

    def test_public_player_board_validation(self):
        with self.assertRaises(TypeError):
            impl.get_legal_moves(create_initial_board(), "X")
        with self.assertRaises(TypeError):
            impl.get_legal_moves([], "B")
        with self.assertRaises(TypeError):
            impl.count_discs([])


# Independent test methods keep each direction visible in focused reports.
for label, dr, dc in (
    ("nw", -1, -1),
    ("n", -1, 0),
    ("ne", -1, 1),
    ("w", 0, -1),
    ("e", 0, 1),
    ("sw", 1, -1),
    ("s", 1, 0),
    ("se", 1, 1),
):

    def direction_test(self, dr=dr, dc=dc):
        board = empty_board()
        board[3 + dr][3 + dc] = "W"
        board[3 + 2 * dr][3 + 2 * dc] = "B"
        self.assertEqual(impl.get_flips(board, "B", Move(3, 3)), [Move(3 + dr, 3 + dc)])

    setattr(RulesTests, "test_capture_" + label, direction_test)
