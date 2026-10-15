# Repository Integration

Othello Python sits alongside the JavaScript Othello challenge and does not replace it.

It supports the same npm command names through an optional adapter, while all functionality remains available through python3 scripts/run.py without Node or npm. Python 3.11 or later and the standard library are sufficient.

The root challenge registry includes othello-python. The shared attempt generator delegates to scripts/new_attempt.py, preserving pinned Python stubs, baseline hashes, standalone tests, and refusal to overwrite earlier attempts.

From the repository root:

```sh
node scripts/create-attempt.cjs othello-python python-session-1
```

Without Node, from othello-python/:

```sh
python3 scripts/run.py practice:new python-session-2
```

Both default to the root attempts/ directory. Use --output to choose another destination. Examples and caches are excluded from generated attempts.

The root ignore rules cover Python bytecode, virtual environments, test/tool caches, coverage output, and local attempts. Python indentation is four spaces.

Repository verification:

```sh
python3 scripts/run.py test:setup
python3 scripts/run.py test:example
python3 scripts/run.py verify:example
python3 maintenance/test_scaffolding.py
```

See the [repository overview](../../README.md) for practice goals and the [project README](../README.md) for commands.
