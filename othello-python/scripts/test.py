"""Run the same acceptance suite against an explicit starter/example target."""
import argparse
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("target", choices=("starter", "example"))
    parser.add_argument("suite", nargs="?", default="all", choices=("all", "setup", "rules", "game", "cli", "verification"))
    parser.add_argument("-k", "--match", help="Run test names containing this substring.")
    parser.add_argument("--failfast", action="store_true")
    args = parser.parse_args()
    from tests import selection
    selection.TARGET = args.target
    print(f"Testing {args.target}: {ROOT / ('src' if args.target == 'starter' else 'example/src')} ({args.suite})", flush=True)
    print(f"Python {sys.version.split()[0]}", flush=True)
    if args.suite == "verification":
        if args.target != "example" or args.match or args.failfast:
            parser.error("Verification requires the example target and does not accept test-name filters.")
        from example.verification.__main__ import main as verify
        verify()
        return 0
    loader = unittest.TestLoader()
    if args.match:
        loader.testNamePatterns = [f"*{args.match}*"]
    groups = ("setup", "rules", "game", "cli") if args.suite == "all" else (args.suite,)
    suite = unittest.TestSuite(loader.loadTestsFromName(f"tests.test_{group}") for group in groups)
    if suite.countTestCases() == 0:
        print("No tests matched; nothing was verified.", file=sys.stderr)
        return 2
    result = unittest.TextTestRunner(verbosity=2, failfast=args.failfast).run(suite)
    return 0 if result.wasSuccessful() else 1


if __name__ == "__main__":
    raise SystemExit(main())
