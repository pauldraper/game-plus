# Game Plus — Coding Interview Practice

Game-based coding challenges for technical interview preparation. Practice reading an existing codebase, implementing rules, handling edge cases, and explaining your decisions while building a working command-line game.

Each challenge has its own source, package manifest, and instructions. Run installation, build, and test commands from the relevant challenge directory.

## Create a Fresh Attempt

Use Node.js 22 or later. From the repository root:

    node scripts/create-attempt.cjs tic-tac-toe session-1
    node scripts/create-attempt.cjs othello session-2
    node scripts/create-attempt.cjs connect-four-practice session-3
    node scripts/create-attempt.cjs minesweeper session-4
    node scripts/create-attempt.cjs othello-python session-5

Each command creates a standalone directory under attempts/ with pinned stubs, current supplied scaffolding, shared behavior tests, and a checklist. It contains no completed solution, dependencies, or build output. Earlier attempts are never overwritten. Install Tic-Tac-Toe dependencies in its attempt directory; the JavaScript challenges require no install.

Choose another destination with --output:

    node scripts/create-attempt.cjs othello othello-01 --output ../game-plus-attempts

The name is optional, including when --output is supplied; omitting it generates a unique name. Options can precede or follow the name.

Run the new attempt's setup checks before starting a timer. Work only in the documented editable files. Implement one checkpoint at a time, run focused tests, then demonstrate a complete CLI session and explain an edge case and complexity. Review the example after the attempt.

All projects print the selected implementation before running tests. Default commands always target the starter; example commands explicitly target the solution. Minimax tests are optional and separate from Tic-Tac-Toe's core challenge.

## Common Commands

Run these from any challenge directory. npm wrappers use Node.js 22 or later; the root .nvmrc selects Node 22. Tic-Tac-Toe needs yarn install first. Othello Python also needs Python 3.11 or later and otherwise uses only the standard library. It can run without Node or npm using the native commands below.

| Command | Purpose |
| --- | --- |
| npm start | Run the starter CLI. Tic-Tac-Toe builds automatically. |
| npm run example | Run the completed solution through an explicit example entry point. |
| npm run test:setup | Check supplied infrastructure before timing. |
| npm run test:rules | Check rule-function contracts. |
| npm run test:game | Check actions, state isolation, and completion. |
| npm run test:cli | Check terminal behavior and complete games. |
| npm test | Run the shared core suite against the starter. |
| npm run test:example | Run the same suite against the solution. |
| npm run verify:example | Run deeper solution verification; Tic-Tac-Toe checks its supplied AI. |
| npm run practice:new -- NAME | Create a fresh local attempt without overwriting earlier work. |

Append -- rules, -- game, or -- cli to test:example for a focused solution check. Pass game options after --, such as npm run example -- --position scenarios/small-win.json for Minesweeper. Yarn can invoke the same script names.

For Python-only practice, use python3 scripts/run.py start, python3 scripts/run.py test:setup, python3 scripts/run.py test:example, and python3 scripts/run.py verify:example from othello-python/. The same dispatcher supports every common command name. Create a fresh attempt without Node using python3 scripts/run.py practice:new python-session-1; it uses the shared root attempts/ directory by default.

## Challenges

| Challenge | Language | Practice |
| --- | --- | --- |
| [Tic-Tac-Toe](tic-tac-toe/README.md) | TypeScript | Complete four rule and winner-detection functions, then compare with the [example solution](tic-tac-toe/example/README.md). Generic interfaces and minimax are supplied. |
| [Othello](othello/README.md) | JavaScript | Complete six rule and turn-management functions in a supplied CLI scaffold. Compare your work with the [completed example](othello/example/README.md). |
| [Connect Four](connect-four-practice/README.md) | JavaScript | Complete six placement, winning-line, and turn-transition functions; review the [solution](connect-four-practice/example/README.md). |
| [Minesweeper](minesweeper/README.md) | JavaScript | Complete six geometry, clue, reveal-region, win, and action functions; review the [solution](minesweeper/example/README.md). |
| [Othello (Python)](othello-python/README.md) | Python 3.11+ | Complete six capture and turn-management functions using dataclasses, independent nested lists, and explicit passes; review the [solution](othello-python/example/README.md). |

```text
game-plus/
├── tic-tac-toe/             TypeScript challenge, tests, and dependencies
│   └── example/            Completed solution with its own build output
├── othello/                JavaScript challenge, shared tests, and scenarios
│   └── example/            Completed game and independent verification
├── connect-four-practice/  Gravity, winning lines, and turn transitions
│   └── example/            Completed source and independent verification
├── minesweeper/            Neighbor geometry, flood traversal, and visibility
│   └── example/            Completed source and independent verification
├── scripts/                Fresh-attempt generator and its verification
├── othello-python/         Standard-library Python challenge and shared tests
│   └── example/            Completed source and independent verification
└── attempts/               Local practice sessions (ignored by Git)
```

## Lessons and Demonstrated Skills

| Skill | Practice | Evidence |
| --- | --- | --- |
| Reading existing code | Trace a command through input, rules, and state updates. | Explain the contracts and make changes without rewriting unrelated code. |
| Modeling state | Represent boards, players, coordinates, and moves. | Keep internal indices and user-facing labels consistent. |
| Translating rules into code | Implement wins, captures, legal moves, and results. | Correctly handle every required direction and endgame condition. |
| Boundary handling | Examine corners, edges, occupied cells, and gaps. | Reject invalid moves without changing state or consuming a turn. |
| Controlling side effects | Copy nested board arrays before applying actions. | Queries leave inputs unchanged and successor states are independent. |
| Python data modeling | Use frozen dataclasses for metadata while copying nested lists. | Explain why frozen State metadata does not make its board immutable; reject boolean coordinates and preserve row independence. |
| Managing turns | Model alternating players, forced passes, and completion. | Distinguish a blocked player, a finished game, and a draw. |
| Region traversal | Expand Minesweeper zero regions with visited tracking and flag boundaries. | Reveal safe numbered boundaries once each without opening mines. |
| Placement and outcome precedence | Drop Connect Four discs and evaluate the resulting position. | Enforce gravity and distinguish a final-square win from a draw. |
| Hidden and visible state | Keep Minesweeper mine locations separate from reveals and flags. | Flags remain guesses, and rejected actions preserve first-reveal protection. |
| Testing and debugging | Use focused tests, regression cases, and CLI scenarios. | Reproduce a defect and show that the fix passes relevant checks. |
| Search algorithms | Trace Tic-Tac-Toe minimax and alpha-beta pruning. | Explain score propagation and why a branch can be skipped. |
| Communication and prioritization | Work incrementally and explain tradeoffs. | Demonstrate completed behavior and describe remaining gaps clearly. |

Tic-Tac-Toe provides a compact exercise in reusable interfaces with optional game-tree search. Othello emphasizes captures and explicit passes. Connect Four adds gravity, longer winning runs, and final-move outcome precedence. Minesweeper introduces graph traversal and separate hidden/visible grids. The core challenges focus on rules and reliable state updates.

## Suggested Practice Session

Set up the runtime and check the supplied shell before starting. For a 90-minute attempt:

1. Spend 10 minutes reading the rules, contracts, and stubs.
2. Spend 55 minutes implementing and checking small pieces of behavior.
3. Spend 20 minutes exercising edge cases and complete CLI interactions.
4. Spend 5 minutes demonstrating results and recording unfinished work.

Attempt the stubs before reviewing the completed example. Record which behaviors work, which are partial, and which remain unimplemented, with tests or terminal examples as evidence. Use the [session worksheet](othello/docs/SESSION-NOTES.md) to organize your review.

For Tic-Tac-Toe, implement the four stubs and verify board updates, wins, draws, and scoring with the supplied tests. Review the completed example after your attempt. Trace a small minimax search as an optional algorithm exercise.

## Adding a Challenge

Create a directory at the repository root. Include its source, package manifest, setup instructions, rules, and verification commands. Keep completed examples separate from practice stubs. Add the challenge and its learning goals to this README.

## License and Attribution

[MIT](LICENSE). The Tic-Tac-Toe framework is based on [pauldraper/game-plus](https://github.com/pauldraper/game-plus). The JavaScript challenges are independent implementations; retain their individual license files.
