/** SPOILERS: independent endpoint-based oracle. Deliberately absent from the starter. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { getFlips, getLegalMoves, countDiscs } from '../src/rules.js';
import { createGame, playMove, passTurn, getResult } from '../src/game.js';
import { keys, freezeDeep } from '../../tests/helpers.js';
import { cli } from '../../tests/cli-helper.js';

function rng(seed) {
  let x = seed >>> 0;
  return () => { x = (Math.imul(x, 1664525) + 1013904223) >>> 0; return x / 2 ** 32; };
}

// Unlike the reference's outward ray scan, consider every friendly endpoint and
// verify that a straight segment to that endpoint contains only opponents.
function oracleFlips(board, player, move) {
  const { row, col } = move;
  if (board[row][col] !== '.') return [];
  const opponent = player === 'B' ? 'W' : 'B';
  const out = new Map();
  for (let endRow = 0; endRow < 8; endRow++) for (let endCol = 0; endCol < 8; endCol++) {
    if (board[endRow][endCol] !== player) continue;
    const dr = endRow - row, dc = endCol - col;
    const distance = Math.max(Math.abs(dr), Math.abs(dc));
    if (distance < 2 || !(dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc))) continue;
    const segment = [];
    for (let k = 1; k < distance; k++) {
      segment.push({ row: row + k * Math.sign(dr), col: col + k * Math.sign(dc) });
    }
    if (segment.every(p => board[p.row][p.col] === opponent)) {
      segment.forEach(p => out.set(`${p.row},${p.col}`, p));
    }
  }
  return [...out.values()];
}
function oracleMoves(board, player) {
  const result = [];
  for (let row = 0; row < 8; row++) for (let col = 0; col < 8; col++) {
    if (oracleFlips(board, player, { row, col }).length) result.push({ row, col });
  }
  return result;
}
function oracleCounts(board) {
  const flat = board.flat();
  return { black: flat.filter(x => x === 'B').length,
    white: flat.filter(x => x === 'W').length, empty: flat.filter(x => x === '.').length };
}

test('independent oracle: 128 seeded boards, both players, all 64 coordinates', () => {
  const random = rng(0xADAB2026);
  for (let iteration = 0; iteration < 128; iteration++) {
    const board = Array.from({ length: 8 }, () =>
      Array.from({ length: 8 }, () => ['.', 'B', 'W'][Math.floor(random() * 3)]));
    freezeDeep(board);
    for (const player of ['B', 'W']) {
      for (let row = 0; row < 8; row++) for (let col = 0; col < 8; col++) {
        assert.deepEqual(keys(getFlips(board, player, { row, col })),
          keys(oracleFlips(board, player, { row, col })), `${iteration}: ${player} ${row},${col}`);
      }
      assert.deepEqual(getLegalMoves(board, player), oracleMoves(board, player));
    }
    assert.deepEqual(countDiscs(board), oracleCounts(board));
  }
});

test('independent oracle: 100 seeded complete games, including passes and final results', () => {
  let observedPasses = 0;
  for (let seed = 1; seed <= 100; seed++) {
    const random = rng(seed);
    let current = createGame();
    const commands = [];
    let actions = 0;
    while (current.status !== 'finished') {
      assert.ok(++actions <= 122, 'Game must terminate within the action bound.');
      const before = freezeDeep(current);
      const legal = oracleMoves(before.board, before.player);
      const opponent = before.player === 'B' ? 'W' : 'B';
      const expectedBoard = before.board.map(row => [...row]);
      let expectedPlayer = opponent;
      if (!legal.length) {
        observedPasses++;
        commands.push('pass');
        current = passTurn(before);
        if (!oracleMoves(before.board, opponent).length) expectedPlayer = before.player;
      } else {
        const move = legal[Math.floor(random() * legal.length)];
        commands.push(String.fromCharCode(65 + move.col) + (move.row + 1));
        const flips = oracleFlips(before.board, before.player, move);
        expectedBoard[move.row][move.col] = before.player;
        for (const p of flips) expectedBoard[p.row][p.col] = before.player;
        current = playMove(before, move);
        assert.equal(oracleCounts(current.board).empty, oracleCounts(before.board).empty - 1);
      }
      const ended = !oracleMoves(expectedBoard, 'B').length && !oracleMoves(expectedBoard, 'W').length;
      assert.deepEqual(current.board, expectedBoard);
      assert.equal(current.player, expectedPlayer);
      assert.equal(current.status, ended ? 'finished' : 'playing');
      assert.notEqual(current.board, before.board);
      current.board.forEach((row, i) => assert.notEqual(row, before.board[i]));
    }
    const counts = oracleCounts(current.board);
    const winner = counts.black === counts.white ? null : counts.black > counts.white ? 'B' : 'W';
    assert.deepEqual(getResult(current), { ...counts, winner, draw: winner === null });
    if (seed === 1) {
      const result = cli(commands.join('\n') + '\n');
      assert.equal(result.status, 0, result.stderr);
      assert.ok(result.stdout.includes(`Final score: B ${counts.black}, W ${counts.white}, empty ${counts.empty}`));
      assert.ok(result.stdout.includes(winner === null ? 'Draw.' : `${winner} wins.`));
      assert.doesNotMatch(result.stdout, /Invalid move:|Not implemented:/);
    }
  }
  assert.ok(observedPasses > 0, 'Seeded games must actually exercise forced passes.');
});
