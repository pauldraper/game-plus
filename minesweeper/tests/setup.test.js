import test from 'node:test';
import assert from 'node:assert/strict';
import { makeGrid, assertMinefield, assertState, parseCoordinate, InvalidMoveError, formatCoordinate } from '../src/model.js';
import { createState, createGame, generateMinefield, prepareReveal, getProgress, stateFromScenario, loadScenario } from '../src/state.js';
import { parseCommand, renderBoard } from '../src/ui.js';
import { stateOf, deepFreeze, assertIsolated, cli } from './helpers.js';

test('grid rows are independently allocated', () => { const a = makeGrid(2, 3); a[0][0] = true; assert.equal(a[1][0], false); });
test('invalid dimensions and nonboolean grid values are rejected', () => {
  assert.throws(() => makeGrid(0, 3), RangeError); assert.throws(() => makeGrid(2.5, 3), TypeError);
  assert.throws(() => makeGrid(2, 3, '.'), TypeError);
});
test('minefield rejects ragged arrays and strings', () => {
  assert.throws(() => assertMinefield([[false], [false, true]]), TypeError);
  assert.throws(() => assertMinefield([['.']]), TypeError);
});
test('board must contain at least one safe square', () => { assert.throws(() => createState([[true]]), RangeError); });
test('fixed state clones mines and creates isolated visibility grids', () => {
  const input = [[false, true]]; const s = createState(input); input[0][0] = true;
  assert.equal(s.mines[0][0], false); assert.equal(s.firstRevealPending, false);
  assert.notStrictEqual(s.revealed[0], s.flagged[0]);
});
test('generated default has 81 cells, 10 mines, and first-reveal protection', () => {
  const s = createGame(); assert.equal(s.mines.length, 9); assert.equal(s.mines[0].length, 9);
  assert.deepEqual(getProgress(s), { mines: 10, flags: 0, revealedSafe: 0, totalSafe: 71 });
  assert.equal(s.firstRevealPending, true);
});
test('same seed reproduces layout; different fixture seeds differ', () => {
  assert.deepEqual(generateMinefield(9,9,10,'a'), generateMinefield(9,9,10,'a'));
  assert.notDeepEqual(generateMinefield(9,9,10,'a'), generateMinefield(9,9,10,'b'));
});
test('generator supports mine-free and dense boards', () => {
  assert.deepEqual(generateMinefield(1,1,0,'a'), [[false]]);
  assert.equal(generateMinefield(2,3,5,'a').flat().filter(Boolean).length, 5);
});
test('generator rejects impossible mine counts', () => {
  for (const count of [-1, 4]) assert.throws(() => generateMinefield(2,2,count), RangeError);
  assert.throws(() => generateMinefield(2,2,1.5), TypeError);
});
test('prepareReveal relocates a first-click mine without changing count or input', () => {
  const s = deepFreeze(stateOf(['*.','..'], { firstRevealPending: true }));
  const next = prepareReveal(s,0,0); assertIsolated(s, next);
  assert.deepEqual(next.mines, [[false,true],[false,false]]);
  assert.equal(next.firstRevealPending, false); assert.equal(next.revealed.flat().some(Boolean), false);
  assert.equal(getProgress(next).mines, 1);
});
test('prepareReveal preserves a safe first selection and copies state', () => {
  const s = stateOf(['*.','..'], { firstRevealPending: true }); const next = prepareReveal(s,1,1);
  assert.deepEqual(next.mines, s.mines); assertIsolated(s,next); assert.equal(next.firstRevealPending,false);
});
test('fixed scenarios do not relocate selected mines', () => {
  const s = stateOf(['*.','..']); assert.deepEqual(prepareReveal(s,0,0).mines, s.mines);
});
test('invalid first reveal does not consume protection', () => {
  const s = deepFreeze(stateOf(['*.','..'], { firstRevealPending: true, flags:['A1'] }));
  assert.throws(() => prepareReveal(s,0,0), InvalidMoveError); assert.equal(s.firstRevealPending, true);
});
test('state rejects simultaneous revealed and flagged cells', () => {
  assert.throws(() => stateOf(['*.','..'], { revealed:['B1'], flags:['B1'] }), TypeError);
});
test('state rejects status inconsistent with revealed mine', () => {
  assert.throws(() => stateOf(['*.','..'], { revealed:['A1'] }), TypeError);
  assert.throws(() => stateOf(['*.','..'], { status:'won' }), TypeError);
});
test('lost scenario must identify exactly the exploded mine', () => {
  const s=stateOf(['*.','..'], { revealed:['A1'], status:'lost', exploded:'A1' }); assertState(s);
  assert.throws(() => stateOf(['*.','.*'], { revealed:['A1','B2'], status:'lost', exploded:'A1' }), TypeError);
});
test('protection cannot remain pending after visibility changes', () => {
  assert.throws(() => stateOf(['*.','..'], { revealed:['B1'], firstRevealPending:true }), TypeError);
});
test('scenario parser rejects wrong symbols, duplicate positions, and ragged rows', () => {
  assert.throws(() => stateFromScenario({layout:['x.']}), TypeError);
  assert.throws(() => stateOf(['..'], {flags:['A1','a1']}), TypeError);
  assert.throws(() => stateOf(['..','.']), TypeError);
});
test('provided scenario loads from disk', () => {
  const s=loadScenario('scenarios/last-safe.json'); assert.equal(getProgress(s).revealedSafe,2);
});
test('coordinate parsing accepts lowercase, surrounding whitespace, and multi-digit rows', () => {
  assert.deepEqual(parseCoordinate(' c12 ',20,9), [11,2]); assert.equal(formatCoordinate(11,2),'C12');
});
test('coordinate parsing rejects partial or out-of-range coordinates', () => {
  for (const value of ['A0','A01','A-1','A1junk','1A','AA1','J1','A10','A 1']) assert.throws(() => parseCoordinate(value,9,9));
});
test('command aliases parse without evaluating any rules', () => {
  for (const input of ['A1','OPEN A1','r a1','reveal A1']) assert.deepEqual(parseCommand(input,9,9),{type:'open',position:[0,0]});
  assert.deepEqual(parseCommand('F b2',9,9),{type:'flag',position:[1,1]});
  assert.deepEqual(parseCommand('  ',9,9),{type:'empty'});
});
test('commands reject excess arguments', () => { for (const text of ['quit now','flag A1 B1','open']) assert.throws(()=>parseCommand(text,9,9)); });
test('rendering does not expose hidden mines or call the clue function for hidden cells', () => {
  const s=stateOf(['*.','..'],{flags:['B1']}); const text=renderBoard(s,()=>{throw new Error('must not be called');});
  assert.equal(text,'   A B\n1  # F\n2  # #');
});
test('renderer uses provided clue counts only for revealed safe cells', () => {
  const s=stateOf(['*.','..'],{revealed:['B1']}); assert.match(renderBoard(s,()=>1),/1  # 1/);
});
test('status does not infer whether flags are correct', () => {
  const s=stateOf(['*.','..'],{flags:['B1','A2']}); assert.equal(getProgress(s).flags,2);
});
test('terminal help, board, status and quit work before implementing stubs', () => {
  const r=cli('help\nboard\nstatus\nquit\n',['--seed','setup']);
  assert.equal(r.status,0); assert.match(r.stdout,/Commands:/); assert.match(r.stdout,/Safe cells: 0\/71/); assert.match(r.stdout,/Goodbye/);
});
test('terminal exits cleanly on EOF',()=>{ const r=cli('',['--seed','setup']);assert.equal(r.status,0); });
test('argument help does not require a game',()=>{const r=cli('',['--help']);assert.equal(r.status,0);assert.match(r.stdout,/--position/);});
test('terminal rejects bad setup and missing position file',()=>{
  for(const args of [['--rows','0'],['--mines','81'],['--wat'],['--seed'],['--position','missing.json'],['--position','scenarios/loss.json','--seed','x']]) {
    const r=cli('',args);assert.equal(r.status,1);assert.match(r.stderr,/Setup error/);
  }
});
