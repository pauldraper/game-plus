"""Repository-maintenance checks, not candidate scoring. No third-party packages."""
from pathlib import Path
import os
import shutil
import subprocess
import sys
from tempfile import TemporaryDirectory
import unittest
import json

ROOT = Path(__file__).resolve().parents[1]


def execute(folder, *args, env=None):
    return subprocess.run([sys.executable, *args], cwd=folder, env=env,
                          text=True, capture_output=True, timeout=30)


def copy_project(destination):
    shutil.copytree(ROOT, destination, ignore=shutil.ignore_patterns("__pycache__", "attempts"))


class ScaffoldingTests(unittest.TestCase):
    def test_fresh_attempt_no_solutions_setup_and_no_overwrite(self):
        with TemporaryDirectory() as directory:
            parent = Path(directory)
            result = execute(ROOT, "scripts/new_attempt.py", "session-1", "--output", str(parent))
            self.assertEqual(result.returncode, 0, result.stderr)
            attempt = parent/"session-1"
            for missing in ("example", "starter", "maintenance", "__pycache__"):
                self.assertFalse((attempt/missing).exists())
            for name in ("game.py", "rules.py"):
                self.assertEqual((attempt/"src"/name).read_bytes(), (ROOT/"starter"/"src"/name).read_bytes())
            metadata = json.loads((attempt/"ATTEMPT.json").read_text())
            self.assertIn("src/rules.py", metadata["baseline_sha256"])
            result = execute(attempt, "scripts/test.py", "starter", "setup")
            self.assertEqual(result.returncode, 0, result.stdout+result.stderr)
            (attempt/"progress.txt").write_text("candidate work")
            result = execute(ROOT, "scripts/new_attempt.py", "session-1", "--output", str(parent))
            self.assertEqual(result.returncode, 1)
            self.assertEqual((attempt/"progress.txt").read_text(), "candidate work")
            result = execute(attempt, "-m", "src.cli", "--example")
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("Local example implementation is absent", result.stderr)

    def test_optional_name_with_output_and_unsafe_names(self):
        with TemporaryDirectory() as folder:
            result = execute(ROOT, "scripts/new_attempt.py", "--output", folder)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual(len(list(Path(folder).iterdir())), 1)
            result = execute(ROOT, "scripts/new_attempt.py", "../escape", "--output", folder)
            self.assertEqual(result.returncode, 2)

    def test_edited_source_does_not_become_new_starter(self):
        with TemporaryDirectory() as folder:
            project = Path(folder)/"project"
            copy_project(project)
            (project/"src"/"rules.py").write_text("# completed candidate work\n")
            result = execute(project, "scripts/new_attempt.py", "clean", "--output", str(Path(folder)/"out"))
            self.assertEqual(result.returncode, 0, result.stderr)
            candidate = Path(folder)/"out"/"clean"/"src"/"rules.py"
            self.assertEqual(candidate.read_bytes(), (ROOT/"starter"/"src"/"rules.py").read_bytes())

    def test_example_runs_without_practice_implementations(self):
        with TemporaryDirectory() as folder:
            project = Path(folder)/"project"
            copy_project(project)
            for name in ("rules.py", "game.py"):
                (project/"src"/name).unlink()
            result = execute(project, "scripts/test.py", "example")
            self.assertEqual(result.returncode, 0, result.stdout+result.stderr)

    def test_setup_runs_without_example(self):
        with TemporaryDirectory() as folder:
            project = Path(folder)/"project"
            copy_project(project)
            shutil.rmtree(project/"example")
            result = execute(project, "scripts/test.py", "starter", "setup")
            self.assertEqual(result.returncode, 0, result.stdout+result.stderr)

    def test_inherited_environment_does_not_switch_test_target(self):
        env = dict(os.environ, CHALLENGE_SOURCE=str(ROOT/"example"), CHALLENGE_TARGET="example",
                   OTHELLO_IMPLEMENTATION="example")
        result = execute(ROOT, "scripts/test.py", "starter", "rules", "--failfast", env=env)
        self.assertEqual(result.returncode, 1)
        self.assertIn("Testing starter:", result.stdout)
        self.assertIn("MissingImplementationError", result.stderr)


if __name__ == "__main__":
    unittest.main(verbosity=2)
