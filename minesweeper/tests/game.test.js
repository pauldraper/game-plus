import test from 'node:test';
import assert from 'node:assert/strict';
import { impl, stateOf, deepFreeze, assertIsolated } from './helpers.js';
import { InvalidMoveError, assertState } from '../src/model.js';
import { createGame, getProgress } from '../src/state.js';

test('reveal a number and leave the game active',()=>{
  const s=stateOf(['*...','..*.','....','....']);const next=impl.revealCell(s,1,1);
  assert.equal(next.status,'playing');assert.equal(getProgress(next).revealedSafe,1);assert.equal(next.revealed[1][1],true);
});
test('reveal a zero region and win when all safe squares open',()=>{
  const next=impl.revealCell(stateOf(['*..','...','...']),2,2);assert.equal(next.status,'won');assert.equal(getProgress(next).revealedSafe,8);assertState(next);
});
test('revealing a fixed mine loses and exposes only the selected mine',()=>{
  const next=impl.revealCell(stateOf(['*..','...','..*']),0,0);
  assert.equal(next.status,'lost');assert.deepEqual(next.exploded,[0,0]);assert.equal(next.revealed[0][0],true);assert.equal(next.revealed[2][2],false);assertState(next);
});
test('last hidden safe square wins without flags',()=>{
  const s=stateOf(['*.','..'],{revealed:['B1','A2']});assert.equal(impl.revealCell(s,1,1).status,'won');
});
test('one-cell mine-free board wins on reveal',()=>{assert.equal(impl.revealCell(stateOf(['.']),0,0).status,'won');});
test('toggleFlag sets and removes exactly one flag',()=>{
  const s=stateOf(['*.','..']);const next=impl.toggleFlag(s,1,1);assert.equal(next.flagged[1][1],true);
  assert.deepEqual(impl.toggleFlag(next,1,1),s);assertIsolated(s,next);
});
test('more flags than mines are permitted but never determine victory',()=>{
  let s=stateOf(['*.','..']);s=impl.toggleFlag(s,0,0);s=impl.toggleFlag(s,0,1);
  assert.equal(getProgress(s).flags,2);assert.equal(s.status,'playing');
});
test('flagging before first reveal preserves safety protection',()=>{
  const s=createGame(3,3,1,'test');const next=impl.toggleFlag(s,0,0);assert.equal(next.firstRevealPending,true);assert.deepEqual(next.mines,s.mines);
});
test('supplied action guards reject flagged or already exposed squares',()=>{
  const s=stateOf(['*.','..'],{flags:['A1'],revealed:['B1']});
  assert.throws(()=>impl.revealCell(s,0,0),InvalidMoveError);
  assert.throws(()=>impl.revealCell(s,0,1),InvalidMoveError);
  assert.throws(()=>impl.toggleFlag(s,0,1),InvalidMoveError);
});
test('supplied action guards reject invalid coordinates',()=>{
  const s=stateOf(['*.','..']);assert.throws(()=>impl.revealCell(s,5,0),RangeError);assert.throws(()=>impl.toggleFlag(s,0,0.5),TypeError);
});
for(const kind of ['won','lost']) test(`both actions reject a ${kind} state`,()=>{
  const s=kind==='won'?stateOf(['*.'],{revealed:['B1'],status:'won'}):stateOf(['*.'],{revealed:['A1'],status:'lost',exploded:'A1'});
  assert.throws(()=>impl.revealCell(s,0,1),InvalidMoveError);assert.throws(()=>impl.toggleFlag(s,0,1),InvalidMoveError);
});
test('invalid actions leave input state completely unchanged',()=>{
  const s=deepFreeze(stateOf(['*.','..'],{flags:['A1']}));const snapshot=JSON.stringify(s);
  assert.throws(()=>impl.revealCell(s,0,0),InvalidMoveError);assert.equal(JSON.stringify(s),snapshot);
});
test('successful reveal returns independent copies of all grid rows',()=>{
  const s=deepFreeze(stateOf(['*..','...','...']));const next=impl.revealCell(s,1,1);assertIsolated(s,next);
  next.flagged[0][0]=true;assert.equal(s.flagged[0][0],false);
});
test('successful flag returns independent rows and does not mutate a frozen source',()=>{
  const s=deepFreeze(stateOf(['*.','..']));const next=impl.toggleFlag(s,0,1);assertIsolated(s,next);assert.equal(s.flagged[0][1],false);
});
test('protected mine selection relocates before computing clue and reveal',()=>{
  const s=stateOf(['*.','..'],{firstRevealPending:true});const next=impl.revealCell(s,0,0);
  assert.equal(next.status,'playing');assert.deepEqual(next.mines,[[false,true],[false,false]]);
  assert.equal(next.revealed[0][0],true);assert.equal(next.exploded,null);assert.equal(next.firstRevealPending,false);
  assert.equal(impl.countAdjacentMines(next.mines,0,0),1);
});
test('first-reveal safety protects only the first successful reveal',()=>{
  let s=stateOf(['*.','..'],{firstRevealPending:true});s=impl.revealCell(s,1,1);
  s=impl.revealCell(s,0,0);assert.equal(s.status,'lost');
});
test('flag rejection does not consume first protection; unflag then reveal remains safe',()=>{
  let s=stateOf(['*.','..'],{firstRevealPending:true});s=impl.toggleFlag(s,0,0);
  assert.throws(()=>impl.revealCell(s,0,0),InvalidMoveError);assert.equal(s.firstRevealPending,true);
  s=impl.toggleFlag(s,0,0);s=impl.revealCell(s,0,0);assert.notEqual(s.status,'lost');
});
test('incorrect safe flag blocks a win until unflagged and exposed',()=>{
  let s=stateOf(['...','...','...'],{flags:['A1']});s=impl.revealCell(s,2,2);
  assert.equal(s.status,'playing');assert.equal(getProgress(s).revealedSafe,8);
  s=impl.toggleFlag(s,0,0);assert.equal(s.status,'playing');s=impl.revealCell(s,0,0);assert.equal(s.status,'won');
});
test('losing does not mark other mines as revealed or remove existing flags',()=>{
  const s=stateOf(['*..','...','..*'],{flags:['B1','C3']});const next=impl.revealCell(s,0,0);
  assert.deepEqual(next.flagged,s.flagged);assert.equal(next.revealed.flat().filter(Boolean).length,1);
});
