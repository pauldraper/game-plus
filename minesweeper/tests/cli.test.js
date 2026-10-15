import test from 'node:test';
import assert from 'node:assert/strict';
import { cli } from './helpers.js';

test('terminal wins a complete small board',()=>{const r=cli('C3\n',['--position','scenarios/small-win.json']);assert.equal(r.status,0);assert.match(r.stdout,/You win!/);assert.match(r.stdout,/Safe cells: 8\/8/);});
test('terminal loses on a mine in a fixed scenario',()=>{const r=cli('A1\n',['--position','scenarios/loss.json']);assert.equal(r.status,0);assert.match(r.stdout,/You hit a mine/);assert.match(r.stdout,/1  X # #/);});
test('terminal opens only the numbered cell requested',()=>{const r=cli('open B2\nstatus\nquit\n',['--position','scenarios/numbered-start.json']);assert.equal(r.status,0);assert.match(r.stdout,/Safe cells: 1\/14/);assert.match(r.stdout,/2  # 2 # #/);});
test('terminal applies flag, rejects reveal, unflags and reveals',()=>{
  const r=cli('flag B2\nB2\nf B2\nB2\nquit\n',['--position','scenarios/numbered-start.json']);
  assert.equal(r.status,0);assert.match(r.stdout,/Flags: 1/);assert.match(r.stdout,/Invalid move: Remove the flag/);assert.match(r.stdout,/Safe cells: 1\/14/);
});
test('terminal recovers from invalid coordinate input',()=>{
  const r=cli('A99\nopen B2 extra\nB2\nquit\n',['--position','scenarios/numbered-start.json']);
  assert.equal(r.status,0);assert.equal((r.stdout.match(/Invalid input:/g)||[]).length,2);assert.match(r.stdout,/Safe cells: 1\/14/);
});
test('terminal rejects a repeat reveal without an extra state update',()=>{
  const r=cli('B2\nB2\nquit\n',['--position','scenarios/numbered-start.json']);assert.match(r.stdout,/Invalid move: This cell is already revealed/);assert.doesNotMatch(r.stdout,/Safe cells: 2\/14/);
});
test('terminal shows an incorrect flag only when game ends',()=>{
  const r=cli('board\nA1\n',['--position','scenarios/wrong-flag-loss.json']);assert.match(r.stdout,/1  # F #/);assert.match(r.stdout,/1  X ! #/);
});
test('terminal stops after completion rather than processing queued moves',()=>{
  const r=cli('C3\nA1\n',['--position','scenarios/small-win.json']);assert.match(r.stdout,/You win!/);assert.doesNotMatch(r.stdout,/You hit a mine/);
});
test('terminal integrates incorrect flag, flood reveal, unflag and final win',()=>{
  const r=cli('C3\nflag A1\nA1\n',['--position','scenarios/flag-block.json']);assert.equal(r.status,0);assert.match(r.stdout,/Safe cells: 8\/9/);assert.match(r.stdout,/Safe cells: 9\/9/);assert.match(r.stdout,/You win!/);
});
test('terminal first-click protection is functional on a scenario that opts in',()=>{
  const r=cli('A1\nquit\n',['--position','scenarios/first-click-protected.json']);assert.equal(r.status,0);assert.match(r.stdout,/Safe cells: 1\/3/);assert.doesNotMatch(r.stdout,/You hit a mine/);
});
test('terminal final safe square wins even with no flags',()=>{
  const r=cli('B2\n',['--position','scenarios/last-safe.json']);assert.match(r.stdout,/You win!/);assert.match(r.stdout,/Flags: 0/);
});
test('terminal generated zero-mine board wins on any first reveal',()=>{
  const r=cli('B2\n',['--rows','3','--columns','3','--mines','0','--seed','test']);assert.equal(r.status,0);assert.match(r.stdout,/You win!/);
});
