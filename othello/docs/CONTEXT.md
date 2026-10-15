# Othello Implementation Context

This challenge uses plain JavaScript and an 8×8 Othello board. The practice source supplies the CLI, input parsing, validation, board display, and test fixtures; six functions in `rules.js` and `game.js` are left for implementation.

The interface uses explicit passes, zero-based internal coordinates, and independent board snapshots. Scenarios are synthetic positions for checking forced passes and game completion.

The completed implementation and independent verification live in `othello/example/`. Practice goals, demonstrated skills, and session guidance are in the [repository overview](../../README.md).

## Technical References

- [Official Othello rules](https://www.worldothello.org/about/about-othello/othello-rules/official-rules/english).
- [Node.js test-runner documentation](https://nodejs.org/api/test.html).
