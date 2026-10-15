import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as rules from '../src/rules.js';
import * as game from '../src/game.js';
import { createState, createGame, seededRandom } from '../../src/state.js';
import { makeGrid, InvalidMoveError, assertState, formatCoordinate } from '../../src/model.js';
import * as oracle from './oracle.js';

const stats={layouts:0,adjacencyComparisons:0,neighborComparisons:0,revealSetComparisons:0,
  exhaustiveActionComparisons:0,simulatedGames:0,simulatedActions:0,invalidActions:0,wins:0,losses:0,
  fullCliReplays:0,largeRegionCells:0};
function compareAction(actual, expected, type, r,c) {
  const snapshot=JSON.stringify(actual);
  let expectedNext;
  try { expectedNext=oracle.act(expected,type,r,c); }
  catch(error) {
    if(!(error instanceof oracle.OracleInvalidMove)) throw error;
    assert.throws(()=> (type==='open'?game.revealCell:game.toggleFlag)(actual,r,c),InvalidMoveError);
    assert.equal(JSON.stringify(actual),snapshot);
    return {actual,expected,invalid:true};
  }
  const actualNext=(type==='open'?game.revealCell:game.toggleFlag)(actual,r,c);
  assert.equal(JSON.stringify(actual),snapshot);
  assert.deepEqual(actualNext,expectedNext);
  assertState(actualNext);
  return {actual:actualNext,expected:expectedNext,invalid:false};
}
for(let mask=0;mask<511;mask++) {
  const board=Array.from({length:3},(_,r)=>Array.from({length:3},(_,c)=>Boolean(mask&(1<<(r*3+c)))));
  stats.layouts++;
  for(let r=0;r<3;r++)for(let c=0;c<3;c++) {
    assert.deepEqual(rules.getNeighbors(board,r,c),oracle.neighbors(board,r,c)); stats.neighborComparisons++;
    assert.equal(rules.countAdjacentMines(board,r,c),oracle.adjacent(board,r,c)); stats.adjacencyComparisons++;
    for(let flag=-1;flag<9;flag++) {
      const state=createState(board);
      if(flag>=0)state.flagged[Math.floor(flag/3)][flag%3]=true;
      assert.deepEqual(rules.getRevealCells(state,r,c),oracle.revealSet(state,r,c));stats.revealSetComparisons++;
      compareAction(state,state,'open',r,c);stats.exhaustiveActionComparisons++;
    }
  }
}
console.log(`Exhaustive 3x3 check: ${stats.layouts} mine layouts, ${stats.revealSetComparisons} reveal-set comparisons and ${stats.exhaustiveActionComparisons} action comparisons.`);

for(let n=0;n<400;n++) {
  const rows=4+n%4,columns=4+Math.floor(n/4)%5,mineCount=Math.max(1,Math.floor(rows*columns/5));
  let actual=createGame(rows,columns,mineCount,`simulation-${n}`),expected=structuredClone(actual);
  const random=seededRandom(`actions-${n}`);
  const step=(type,r,c)=>{
    const result=compareAction(actual,expected,type,r,c);actual=result.actual;expected=result.expected;
    stats.simulatedActions++;if(result.invalid)stats.invalidActions++;
  };
  for(let j=0;j<200 && actual.status==='playing';j++) {
    const type=random()<0.25?'flag':'open';
    const candidates=[];
    for(let r=0;r<rows;r++)for(let c=0;c<columns;c++) {
      if(type==='flag' || random()<0.12 || (!expected.mines[r][c] && !expected.revealed[r][c]))candidates.push([r,c]);
    }
    const [r,c]=candidates.length?candidates[Math.floor(random()*candidates.length)]:[0,0];
    step(type,r,c);
  }
  // Test completion, not playing skill: inspection of full state is intentional.
  for(let r=0;r<rows && actual.status==='playing';r++)for(let c=0;c<columns && actual.status==='playing';c++) {
    if(expected.mines[r][c] || expected.revealed[r][c])continue;
    if(expected.flagged[r][c])step('flag',r,c);
    step('open',r,c);
  }
  assert.notEqual(actual.status,'playing');stats.simulatedGames++;
  if(actual.status==='won')stats.wins++;else stats.losses++;
}
console.log(`Simulation check: ${stats.simulatedGames} finished games, ${stats.simulatedActions} actions (${stats.invalidActions} rejected), ${stats.wins} wins and ${stats.losses} losses.`);

const large=createState(makeGrid(128,128));
const cells=rules.getRevealCells(large,0,0);
assert.equal(cells.length,16384);assert.equal(new Set(cells.map(p=>p.join(','))).size,16384);
assert.deepEqual(cells[0],[0,0]);assert.deepEqual(cells.at(-1),[127,127]);
assert.equal(game.revealCell(large,0,0).status,'won');stats.largeRegionCells=cells.length;

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
for(let i=0;i<8;i++) {
  const seed=`cli-${i}`;let state=createGame(6,6,6,seed);const commands=['open A1'];
  state=oracle.act(state,'open',0,0);
  for(let r=0;r<6 && state.status==='playing';r++)for(let c=0;c<6 && state.status==='playing';c++) {
    if(state.mines[r][c] || state.revealed[r][c])continue;
    commands.push(`open ${formatCoordinate(r,c)}`);state=oracle.act(state,'open',r,c);
  }
  assert.equal(state.status,'won');
  const run=spawnSync(process.execPath,['example/src/cli.js','--rows','6','--columns','6','--mines','6','--seed',seed],
    {cwd:root,encoding:'utf8',input:commands.join('\n')+'\n',timeout:10000});
  assert.equal(run.error,undefined);assert.equal(run.status,0);assert.match(run.stdout,/You win!/);
  assert.doesNotMatch(run.stdout,/Invalid move:|Unexpected error:|Not implemented:/);stats.fullCliReplays++;
}
console.log(`Stress check: ${stats.largeRegionCells} cells. CLI check: ${stats.fullCliReplays} complete generated-board replays.`);
console.log(JSON.stringify(stats,null,2));
