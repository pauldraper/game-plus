/**
 * Independent verification implementation, not used by the game or main tests.
 * Uses whole-board coordinate filtering and fixed-point closure rather than
 * the example's bounded directional loops and queue-based traversal.
 */
export class OracleInvalidMove extends Error {}
const allCells = board => board.flatMap((line, r) => line.map((_, c) => [r, c]));
export function neighbors(board, r, c) {
  return allCells(board).filter(([x,y]) => (x!==r || y!==c) && Math.abs(x-r)<=1 && Math.abs(y-c)<=1);
}
export function adjacent(board, r, c) {
  return allCells(board).filter(([x,y]) => board[x][y] && (x!==r || y!==c) && Math.max(Math.abs(x-r), Math.abs(y-c))===1).length;
}
export function revealSet(state, r, c) {
  if (state.mines[r][c] || state.flagged[r][c] || state.revealed[r][c]) return [];
  const cells = allCells(state.mines), width = state.mines[0].length;
  const key = (r,c) => r*width+c;
  const counts = new Map(cells.map(([x,y])=>[key(x,y),adjacent(state.mines,x,y)]));
  const selected = new Set([key(r,c)]);
  let changed;
  do {
    changed = false;
    for (const [x,y] of cells) {
      if (state.mines[x][y] || state.flagged[x][y] || selected.has(key(x,y))) continue;
      const touchesZero = cells.some(([zr,zc]) => selected.has(key(zr,zc)) && counts.get(key(zr,zc))===0 &&
        Math.max(Math.abs(zr-x), Math.abs(zc-y))===1);
      if (touchesZero) { selected.add(key(x,y)); changed = true; }
    }
  } while(changed);
  return cells.filter(([x,y])=>selected.has(key(x,y)) && !state.revealed[x][y]);
}
export function won(state) {
  return allCells(state.mines).every(([r,c]) => state.mines[r][c] ? !state.revealed[r][c] : state.revealed[r][c]);
}
export function act(state, type, r, c) {
  if (state.status !== 'playing' || state.revealed[r][c] || (type==='open' && state.flagged[r][c])) throw new OracleInvalidMove();
  const next = structuredClone(state);
  if (type==='flag') { next.flagged[r][c]=!next.flagged[r][c]; return next; }
  if (next.firstRevealPending && next.mines[r][c]) {
    const index = next.mines.flat().findIndex(mine=>!mine);
    const width = next.mines[0].length;
    next.mines[Math.floor(index/width)][index%width]=true;
    next.mines[r][c]=false;
  }
  next.firstRevealPending=false;
  if (next.mines[r][c]) {
    next.revealed[r][c]=true; next.status='lost'; next.exploded=[r,c];
  } else {
    for(const [x,y] of revealSet(next,r,c)) next.revealed[x][y]=true;
    next.status=won(next)?'won':'playing';
  }
  return next;
}
