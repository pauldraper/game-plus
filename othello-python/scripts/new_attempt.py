"""Create a standalone attempt with pinned stubs, without copying the solution."""
import argparse
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re
import shutil
import sys
from uuid import uuid4

ROOT = Path(__file__).resolve().parents[1]
BASE_REF = "b662a82b2ec94a126cda1e01a93deb81e961c7ba"


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("name", nargs="?", help="A new session name; an existing directory is never overwritten.")
    parser.add_argument("--output", type=Path, default=ROOT.parent / "attempts", help="Parent directory for attempts.")
    args = parser.parse_args(argv)
    name = args.name or ("othello-python-" + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ") + "-" + uuid4().hex[:8])
    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]{0,63}", name):
        parser.error("Use a 1-64 character name beginning with a letter or digit; no slashes.")
    destination = args.output.resolve() / name
    if destination.is_relative_to(ROOT) and not destination.is_relative_to(ROOT / "attempts"):
        parser.error("Inside the source project, output must be under attempts/. Choose an external directory instead.")
    if destination.exists():
        print(f"Attempt already exists; nothing changed: {destination}", file=sys.stderr)
        return 1
    try:
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.mkdir()  # Atomic non-overwrite check, including competing creation.
    except OSError as error:
        print(f"Could not create attempt: {error}", file=sys.stderr)
        return 1
    try:
        for folder in ("src", "tests", "scenarios"):
            shutil.copytree(ROOT / folder, destination / folder,
                            ignore=shutil.ignore_patterns("__pycache__", "*.pyc", "*.pyo"))
        for name in ("rules.py", "game.py"):
            shutil.copy2(ROOT / "starter" / "src" / name, destination / "src" / name)
        for folder in ("scripts", "docs"):
            (destination / folder).mkdir()
        for name in ("CHALLENGE.md", "SESSION-NOTES.md"):
            shutil.copy2(ROOT / "docs" / name, destination / "docs" / name)
        for name in ("test.py", "run.py", "run.cjs"):
            shutil.copy2(ROOT / "scripts" / name, destination / "scripts" / name)
        if (ROOT / "package.json").exists():
            manifest = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))
            manifest["name"] = "othello-python-attempt"
            for name in list(manifest["scripts"]):
                if "example" in name or name == "practice:new":
                    del manifest["scripts"][name]
            (destination / "package.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
        for name in ("LICENSE", ".editorconfig", ".gitignore"):
            shutil.copy2(ROOT / name, destination / name)
        (destination / "README.md").write_text(
            "# Othello Python - Fresh Attempt\n\n"
            "Read [the challenge contract](docs/CHALLENGE.md). Implement only src/rules.py and src/game.py.\n\n"
            "Python 3.11 or newer; standard library only. From this directory:\n\n"
            "```sh\npython3 scripts/run.py test:setup\npython3 scripts/run.py start\n"
            "python3 scripts/run.py test\n```\n\n"
            "The setup suite should pass. Rule-dependent tests fail until you implement the stubs. "
            "Record progress in [session notes](docs/SESSION-NOTES.md). No completed example, "
            "oracle, pinned-template directory, or build output is included.\n\n"
            "Initialize your own Git history here before editing; parent-repository commits may "
            "not include this directory. Local commits alone are not an off-device backup.\n",
            encoding="utf-8",
        )
        hashes = {p.relative_to(destination).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
                  for p in sorted(destination.rglob("*")) if p.is_file()}
        metadata = {"challenge": "othello-python", "created_utc": datetime.now(timezone.utc).isoformat(),
                    "javascript_contract_ref": BASE_REF, "baseline_sha256": hashes}
        (destination / "ATTEMPT.json").write_text(json.dumps(metadata, indent=2) + "\n", encoding="utf-8")
    except Exception:
        # Only the directory newly created by this invocation is removed on failure.
        shutil.rmtree(destination)
        raise
    print(f"Created fresh attempt: {destination}")
    print("Pinned stubs included; examples excluded; earlier attempts unchanged.")
    print("Save a baseline in this attempt's own Git history before practicing.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
