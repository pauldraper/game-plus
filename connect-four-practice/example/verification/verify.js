/** Additional review-only verification; not imported by the normal practice tests. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createBoard, countDiscs, assertGravity } from '../../src/model.js';
import { createInitialState, parsePosition } from '../../src/state.js';
import * as rules from '../src/rules.js';
import { playMove } from '../src/game.js';
import { oracleWinner, oracleColumns, oracleDrop, seededRandom } from './oracle.js';

test('all 69 four-cell windows detect both players and reject one-cell gaps', t => {
  let windows = 0;
  let comparisons = 0;
  for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
    for (let row = 0; row < 6; row += 1) {
      for (let col = 0; col < 7; col += 1) {
        const endRow = row + 3 * dr; const endCol = col + 3 * dc;
        if (endRow < 0 || endRow >= 6 || endCol < 0 || endCol >= 7) continue;
        windows += 1;
        for (const player of ['R', 'Y']) {
          const board = createBoard();
          for (let k = 0; k < 4; k += 1) board[row + k * dr][col + k * dc] = player;
          assert.equal(oracleWinner(board), player);
          assert.equal(rules.getWinner(board), player);
          comparisons += 1;
          for (let k = 0; k < 4; k += 1) {
            board[row + k * dr][col + k * dc] = '.';
            assert.equal(oracleWinner(board), null);
            assert.equal(rules.getWinner(board), null);
            comparisons += 1;
            board[row + k * dr][col + k * dc] = player;
          }
        }
      }
    }
  }
  assert.equal(windows, 69);
  t.diagnostic(`${comparisons} explicit winner/nonwinner comparisons across ${windows} windows.`);
});

test('1000 deterministic full games agree with an independent bitboard oracle', t => {
  const random = seededRandom(0xC04F2026);
  let checkedStates = 0;
  let wins = 0;
  let draws = 0;
  for (let game = 0; game < 1000; game += 1) {
    let state = createInitialState();
    let turns = 0;
    while (state.status === 'playing') {
      const choices = oracleColumns(state.board);
      assert.ok(choices.length > 0);
      assert.deepEqual(rules.getLegalColumns(state.board), choices);
      assert.equal(rules.getWinner(state.board), oracleWinner(state.board));
      const column = choices[Math.floor(random() * choices.length)];
      const expectedBoard = oracleDrop(state.board, state.player, column);
      const expectedWinner = oracleWinner(expectedBoard);
      const expectedFull = expectedBoard.every(row => row.every(cell => cell !== '.'));
      const expectedFinished = expectedWinner !== null || expectedFull;
      const before = JSON.stringify(state);
      for (const row of state.board) Object.freeze(row);
      Object.freeze(state.board); Object.freeze(state);
      const next = playMove(state, column);
      assert.deepEqual(next.board, expectedBoard);
      assert.equal(next.winner, expectedWinner);
      assert.equal(next.status, expectedFinished ? 'finished' : 'playing');
      assert.equal(next.player, expectedFinished ? state.player : (state.player === 'R' ? 'Y' : 'R'));
      assert.equal(rules.isDraw(next.board), expectedWinner === null && expectedFull);
      assert.deepEqual(rules.getLegalColumns(next.board), oracleColumns(next.board));
      assert.equal(JSON.stringify(state), before);
      assertGravity(next.board);
      for (let row = 0; row < 6; row += 1) assert.notEqual(next.board[row], state.board[row]);
      turns += 1;
      assert.equal(countDiscs(next.board).empty, 42 - turns);
      assert.ok(turns <= 42);
      state = next;
      checkedStates += 1;
    }
    if (state.winner) wins += 1;
    else draws += 1;
    assert.deepEqual(rules.getLegalColumns(state.board), []);
    assert.throws(() => playMove(state, 0), { name: 'InvalidMoveError' });
  }
  assert.equal(wins + draws, 1000);
  t.diagnostic(`${checkedStates} state transitions; ${wins} wins; ${draws} draws; seed=0xC04F2026.`);
});

test('all saved replay fixtures are reachable and first finish at their last move', t => {
  for (const name of ['final-draw', 'final-square-win', 'diagonal-down', 'diagonal-up']) {
    const record = JSON.parse(readFileSync(new URL(`../../scenarios/${name}-replay.json`, import.meta.url), 'utf8'));
    const fixture = parsePosition(readFileSync(new URL(`../../scenarios/${name}.json`, import.meta.url), 'utf8'));
    let board = createBoard(); let player = 'R';
    for (let i = 0; i < record.moves.length; i += 1) {
      const col = record.moves[i] - 1;
      assert.equal(oracleWinner(board), null);
      assert.ok(oracleColumns(board).includes(col));
      if (i === record.moves.length - 1) {
        assert.deepEqual(fixture.board, board);
        assert.equal(fixture.player, player);
      }
      board = oracleDrop(board, player, col);
      player = player === 'R' ? 'Y' : 'R';
    }
    assert.equal(oracleWinner(board), record.winner);
    if (record.winner === null) assert.equal(oracleColumns(board).length, 0);
    t.diagnostic(`${name}: ${record.moves.length} legal moves.`);
  }
});
