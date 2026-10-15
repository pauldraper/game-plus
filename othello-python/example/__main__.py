"""Explicit example entry point, independent of src/rules.py and src/game.py."""
from src.cli import main

if __name__ == "__main__":
    raise SystemExit(main(target="example"))
