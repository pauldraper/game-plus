"""Common challenge commands without requiring Node, npm, or third-party packages."""
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
COMMANDS = {
    "start": ["-m", "src.cli"],
    "example": ["-m", "example.src.cli"],
    "test": ["scripts/test.py", "starter"],
    "test:example": ["scripts/test.py", "example"],
    "verify:example": ["scripts/test.py", "example", "verification"],
    "practice:new": ["scripts/new_attempt.py"],
}
for group in ("setup", "rules", "game", "cli"):
    COMMANDS[f"test:{group}"] = ["scripts/test.py", "starter", group]


def main(argv: list[str] | None = None) -> int:
    args = sys.argv[1:] if argv is None else argv
    if not args or args[0] not in COMMANDS:
        print("Usage: python3 scripts/run.py " + "|".join(COMMANDS) + " [options]", file=sys.stderr)
        return 2
    if sys.version_info < (3, 11):
        print("Python 3.11 or later is required.", file=sys.stderr)
        return 2
    command = COMMANDS[args[0]]
    if command[0] == "scripts/new_attempt.py" and not (ROOT / command[0]).exists():
        print("Create new attempts from the original challenge, not an attempt copy.", file=sys.stderr)
        return 2
    result = subprocess.run([sys.executable, *command, *args[1:]], cwd=ROOT)
    return result.returncode if result.returncode >= 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
