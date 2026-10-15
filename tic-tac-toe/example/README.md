# Tic-Tac-Toe — Completed Example

The solution is in src/. It is independent of the practice stubs in ../src/ and uses the shared tests in ../tests/.

Install dependencies in tic-tac-toe/, then run from that directory:

```sh
npm run example -- --player2 ai
npm run test:example
npm run test:example:ai
```

The example command builds example/lib before starting. Omit --player2 ai for two people; append --player1 ai --player2 ai for two computer players. Coordinates are uppercase, such as B2. Commands include moves, score, board, help, and quit.

The CLI handles piped lines, EOF, and invalid actions. Completion is an explicit outcome; score is only the AI evaluation.

From this directory, npm start, npm test, and npm run test:ai are available after the parent dependencies are installed.

Review the [challenge contract](../docs/CHALLENGE.md) and [practice instructions](../README.md) after your attempt.
