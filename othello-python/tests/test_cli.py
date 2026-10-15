import unittest
from tests.support import cli, TARGET


class CliTests(unittest.TestCase):
    def test_explicit_target_banner(self):
        result = cli("quit\n")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn(TARGET.upper()+" mode", result.stdout)

    def test_opening_moves_and_counts(self):
        result = cli("moves\nscore\nquit\n")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("D3, C4, F5, E6", result.stdout)
        self.assertIn("B 2, W 2, empty 60", result.stdout)
        self.assertNotIn("Not implemented", result.stdout)

    def test_legal_move_changes_turn_and_count(self):
        result = cli("d3\nscore\nquit\n")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("Turn: W", result.stdout)
        self.assertIn("B 4, W 1, empty 59", result.stdout)

    def test_occupied_move_rejected(self):
        result = cli("d3\nd3\nscore\nquit\n")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("Invalid move:", result.stdout)
        self.assertIn("B 4, W 1, empty 59", result.stdout)

    def test_illegal_pass_followed_by_valid_move(self):
        result = cli("pass\nd3\nquit\n")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("Invalid move:", result.stdout)
        self.assertIn("Turn: W", result.stdout)

    def test_forced_pass_to_final_move(self):
        result = cli("pass\na1\n", ("--position", "scenarios/forced-pass.json"))
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("Turn: W", result.stdout)
        self.assertIn("Final score: B 61, W 3, empty 0", result.stdout)
        self.assertIn("B wins.", result.stdout)

    def test_both_blocked_terminal(self):
        result = cli("pass\n", ("--position", "scenarios/both-blocked.json"))
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("Final score: B 63, W 0, empty 1", result.stdout)
        self.assertIn("B wins.", result.stdout)

    def test_final_draw(self):
        result = cli("a1\n", ("--position", "scenarios/final-draw.json"))
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("Final score: B 32, W 32, empty 0", result.stdout)
        self.assertIn("Draw.", result.stdout)
