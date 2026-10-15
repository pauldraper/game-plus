/**
 * Independent review oracle. Uses column-major bitboards with a sentinel bit
 * between columns, not the example's directional-window scan.
 * Never imported by the starter, shared unit tests, or CLI.
 */
export function oracleWinner(board) {
  for (const player of ['R', 'Y']) {
    let bits = 0n;
    for (let col = 0; col < 7; col += 1) {
      for (let row = 0; row < 6; row += 1) {
        if (board[row][col] === player) bits |= 1n << BigInt(col * 7 + 5 - row);
      }
    }
    for (const shift of [1n, 7n, 6n, 8n]) {
      const pairs = bits & (bits >> shift);
      if ((pairs & (pairs >> (2n * shift))) !== 0n) return player;
    }
  }
  return null;
}

export function oracleColumns(board) {
  if (oracleWinner(board)) return [];
  return Array.from({ length: 7 }, (_, col) => col).filter(col => board[0][col] === '.');
}

export function oracleDrop(board, player, col) {
  const height = board.reduce((count, row) => count + (row[col] === '.' ? 0 : 1), 0);
  if (height === 6) throw new Error('Oracle column full.');
  const next = board.map(row => [...row]);
  next[5 - height][col] = player;
  return next;
}

export function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    return value / 2 ** 32;
  };
}
