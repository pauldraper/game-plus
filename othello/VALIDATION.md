# Othello Verification

Use Node.js 22 or later. The package has no third-party dependencies or build step.

From this directory:

```sh
npm run test:setup
npm test
npm run test:example
```

The test runner prints the selected implementation and overrides inherited target settings. Starter and example use the same 72 behavior tests in tests/. Only the example runs the two independent oracle tests in example/verification/.

Verified on Node.js v25.8.2:

- Starter setup: 21 passing tests.
- Untouched starter: 25 passes and 47 expected failures from unfinished functions.
- Completed example: 74 passing tests, including 128 seeded-board comparisons and 100 complete seeded games.

The CLI tests include malformed input, illegal actions, forced passes, end-of-input, and final wins/draws.

Fresh attempts are checked by node --test scripts/create-attempt.test.cjs from the repository root. The check verifies pinned stubs, solution exclusion, setup functionality, and refusal to overwrite an existing attempt.
