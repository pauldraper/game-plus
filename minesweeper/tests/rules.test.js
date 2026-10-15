import test from 'node:test';
import assert from 'node:assert/strict';
import { impl, stateOf, deepFreeze } from './helpers.js';
import { makeGrid } from '../src/model.js';
import { createState } from '../src/state.js';

const corners=[[[0,0],[[0,1],[1,0],[1,1]]],[[0,2],[[0,1],[1,1],[1,2]]],[[2,0],[[1,0],[1,1],[2,1]]],[[2,2],[[1,1],[1,2],[2,1]]]];
for(const [position, expected] of corners) test(`neighbors at corner ${position} stay in bounds`,()=>assert.deepEqual(impl.getNeighbors(makeGrid(3,3),...position),expected));
test('neighbors at edge and interior are ordered and do not include self',()=>{
  assert.deepEqual(impl.getNeighbors(makeGrid(3,3),0,1),[[0,0],[0,2],[1,0],[1,1],[1,2]]);
  assert.deepEqual(impl.getNeighbors(makeGrid(3,3),1,1),[[0,0],[0,1],[0,2],[1,0],[1,2],[2,0],[2,1],[2,2]]);
});
test('neighbors support a one-cell, one-row and one-column board',()=>{
  assert.deepEqual(impl.getNeighbors([[false]],0,0),[]);
  assert.deepEqual(impl.getNeighbors([[false,false,false]],0,1),[[0,0],[0,2]]);
  assert.deepEqual(impl.getNeighbors([[false],[false],[false]],1,0),[[0,0],[2,0]]);
});
test('supplied query guards reject malformed coordinates',()=>{
  assert.throws(()=>impl.getNeighbors([[false]],-1,0),RangeError);
  assert.throws(()=>impl.countAdjacentMines([[false]],0,'0'),TypeError);
});
for(const [r,c] of [[0,0],[0,1],[0,2],[1,0],[1,2],[2,0],[2,1],[2,2]]) test(`clue counts a mine in neighbor ${r},${c}`,()=>{
  const b=makeGrid(3,3);b[r][c]=true;assert.equal(impl.countAdjacentMines(b,1,1),1);
});
test('clue supports all eight mines and excludes the center itself',()=>{
  const b=makeGrid(3,3,true);b[1][1]=false;assert.equal(impl.countAdjacentMines(b,1,1),8);
  assert.equal(impl.countAdjacentMines([[true,false]],0,0),0);
});
test('clue does not wrap between left and right edges',()=>{
  assert.equal(impl.countAdjacentMines([[false,false,true],[false,false,false]],1,0),0);
});
test('numbered square reveals only itself',()=>{
  const s=stateOf(['*...','..*.','....','....']);assert.deepEqual(impl.getRevealCells(s,1,1),[[1,1]]);
});
test('zero region includes its numbered boundary without mines',()=>{
  const s=stateOf(['*..','...','...']);assert.deepEqual(impl.getRevealCells(s,2,2),[[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]]);
});
test('number boundaries do not join separate zero regions',()=>{
  const s=stateOf(['..*..','.....','..*..']);assert.deepEqual(impl.getRevealCells(s,1,0),[[0,0],[0,1],[1,0],[1,1],[2,0],[2,1]]);
});
test('a flag blocks exposure and traversal along a corridor',()=>{
  const s=stateOf(['.....'],{flags:['C1']});assert.deepEqual(impl.getRevealCells(s,0,0),[[0,0],[0,1]]);
});
test('already revealed zeros may bridge a new region but are not returned',()=>{
  const s=stateOf(['.....'],{revealed:['B1']});assert.deepEqual(impl.getRevealCells(s,0,0),[[0,0],[0,2],[0,3],[0,4]]);
});
test('blocked start queries return an empty list',()=>{
  const s=stateOf(['*..','...'],{flags:['B1'],revealed:['C1']});
  for(const p of [[0,0],[0,1],[0,2]])assert.deepEqual(impl.getRevealCells(s,...p),[]);
});
test('a safe flag is omitted even when surrounded by a revealed region',()=>{
  const s=stateOf(['...','...','...'],{flags:['B2']});const list=impl.getRevealCells(s,0,0);
  assert.equal(list.length,8);assert.ok(!list.some(([r,c])=>r===1&&c===1));
});
test('large zero region has no duplicate results and no recursive overflow',()=>{
  const s=createState(makeGrid(64,64));const list=impl.getRevealCells(s,0,0);assert.equal(list.length,4096);assert.equal(new Set(list.map(p=>p.join(','))).size,4096);
});
test('queries preserve deeply frozen input state',()=>{
  const s=deepFreeze(stateOf(['*..','...','...']));const snap=JSON.stringify(s);
  impl.getNeighbors(s.mines,2,2);impl.countAdjacentMines(s.mines,2,2);impl.getRevealCells(s,2,2);impl.isWon(s);
  assert.equal(JSON.stringify(s),snap);
});
test('new game and correctly flagged mines alone are not wins',()=>{
  assert.equal(impl.isWon(stateOf(['*.','..'])),false);
  assert.equal(impl.isWon(stateOf(['*.','..'],{flags:['A1']})),false);
});
test('all safe squares exposed wins with or without mine flags',()=>{
  const positions=['B1','A2','B2'];
  assert.equal(impl.isWon(stateOf(['*.','..'],{revealed:positions})),true);
  assert.equal(impl.isWon(stateOf(['*.','..'],{revealed:positions,flags:['A1']})),true);
});
test('a flag covering a hidden safe square prevents a win',()=>{
  const s=stateOf(['*.','..'],{revealed:['B1','A2'],flags:['B2']});assert.equal(impl.isWon(s),false);
});
test('revealed mine is never a win, even if all safe cells are exposed',()=>{
  const s=stateOf(['*.'],{revealed:['A1','B1'],status:'lost',exploded:'A1'});assert.equal(impl.isWon(s),false);
});
