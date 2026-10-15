# Completed Minesweeper Example

This folder is the working implementation and post-attempt review material. The challenge stubs remain in `../src/rules.js` and `../src/game.js`.

Run from the project root:

```bash
npm run example
npm run test:example
npm run verify:example
```

The example uses shared model, generation, and terminal utilities. It does **not** import the unfinished practice rules or actions. Completing or breaking those two practice files does not change which implementation example mode loads.

From this directory, npm start, npm test, and npm run verify are also available. The supplied model, generation, and shell remain in ../src/; solution functions live in src/.

## Reading Order

1. `src/rules.js`: surrounding positions, clue counts, reveal regions, and win detection.
2. `src/game.js`: validated actions, isolated state updates, and terminal results.
3. `verification/oracle.js`: a separate way to calculate expected behavior.
4. `verification/verify.js`: how those implementations are compared.

Practice goals and demonstrated skills are in the [repository overview](../../README.md).

## The Reveal Algorithm

The working implementation uses a queue with a cursor rather than repeatedly removing the first array element. It remembers each coordinate when adding it to the queue, so cycles do not produce repeated work.

A numbered starting cell is returned without further expansion. A zero cell adds safe, unflagged neighbors. Numbered boundary cells are returned but do not expand. Already revealed zero cells can provide a connection to another part of the region; they are traversed but omitted from the returned list.

Flags block both exposure and expansion. The engine does not peek at a flag and decide whether it is correct. A flag on a safe square must still be removed by the player.

The result is sorted into row-major order to meet the public contract, independent of the queue's discovery order.

### Why the Visited Set Matters

Neighbor relationships form cycles. Without visited tracking, opening a large empty area can process the same positions indefinitely or repeatedly. Marking at enqueue time also keeps multiple neighbors from adding the same coordinate before it is processed.

An iterative implementation avoids depending on the JavaScript call stack for a long reveal chain. The stress verification includes a 128×128 empty region.

## Actions and First-Reveal Safety

`prepareReveal` is supplied infrastructure, not one of the six practice tasks. It validates the action, clones the state, and relocates a mine only when the first successful reveal is protected.

`revealCell` must calculate the visible region against that **prepared copy**, not the original minefield. Otherwise, a moved mine can leave stale clue counts or cause an incorrectly handled loss.

If the selected square still has a mine, this is an ordinary unprotected mine hit: mark only that mine revealed and record the loss. All other mines remain hidden in storage, even though the terminal displays their locations after the game ends.

For a safe selection, open the region and then compute the win condition from the resulting visibility grid.

`toggleFlag` copies the state and changes exactly one flag. It does not consume protection or declare a win. The supplied guards prevent flagging revealed squares and actions after game completion.

## Win Detection

A win requires every safe square to be exposed and no mine to be exposed. Correctly flagging all mines is neither required nor sufficient.

In particular, all mines flagged with safe cells still hidden is an unfinished game. A false flag on the only remaining safe cell blocks a win until that flag is removed and the square is opened.

## Complexity and Tradeoffs

Let **N** be the number of cells and **K** the number of cells traversed in a reveal.

| Operation | Complexity of this implementation |
| --- | --- |
| Public neighbor/clue query | O(N), because full minefield validation precedes the constant-sized local query. |
| Internal local neighbor/clue helper | O(1), at most eight surrounding positions. |
| Reveal-region query | O(N + K log K), including validation and sorting the result into row-major order; traversal itself is O(K). |
| Win predicate | O(N). |
| Flag action | O(N) time and memory for validation and independent grid copies. |
| Reveal action | O(N + K log K) time and O(N) additional memory in the worst case. |

The renderer calls the validated public clue function for each revealed safe cell, so a full render can take O(N²) time. That is acceptable for this small CLI exercise but is not the best design for a large graphical board. A later extension could cache clue counts, invalidate the cache after first-click relocation, or expose a once-validated rendering snapshot.

Another optional improvement is to emit coordinates in board order using a visibility mask instead of sorting. Neither optimization is a prerequisite for correctly completing the core exercise.

## Independent Verification

`oracle.js` does not call the example's neighbor, clue, flood, or game-action functions. It enumerates whole-board coordinates, calculates adjacency using coordinate distances, and grows the reveal set to a fixed point instead of using the example's queue.

The verification runner compares the two implementations on every 3×3 mine layout that leaves at least one safe cell, at every starting square, with no flag and with each possible single flag. It also exercises invalid actions and complete games.

The oracle is a separately written check, not a formal proof or third-party certification. It shares the supplied state factories and the agreed game contract. See [the validation report](../VALIDATION.md) for actual counts and limitations.
