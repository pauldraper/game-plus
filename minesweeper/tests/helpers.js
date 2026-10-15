import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve, dirname } from 'node:path';
import { stateFromScenario } from '../src/state.js';
if (
  !process.env.CHALLENGE_SOURCE ||
  !['starter', 'example'].includes(process.env.CHALLENGE_TARGET)
) {
  throw new Error('Run scripts/test.cjs with an explicit starter or example target.');
}
export const mode = process.env.CHALLENGE_TARGET === 'example' ? 'example' : 'practice';
export const impl = {
  ...(await import(pathToFileURL(resolve(process.env.CHALLENGE_SOURCE, 'rules.js')))),
  ...(await import(pathToFileURL(resolve(process.env.CHALLENGE_SOURCE, 'game.js')))),
};
export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const stateOf = (layout, extra = {}) => stateFromScenario({ layout, ...extra });
export function deepFreeze(value) {
  if (value && typeof value === 'object') {
    Object.freeze(value);
    for (const v of Object.values(value)) deepFreeze(v);
  }
  return value;
}
export function assertIsolated(before, after) {
  assert.notStrictEqual(before, after);
  for (const name of ['mines', 'revealed', 'flagged']) {
    assert.notStrictEqual(before[name], after[name]);
    for (let r = 0; r < before[name].length; r++)
      assert.notStrictEqual(before[name][r], after[name][r]);
  }
}
export function cli(input = '', args = [], selectedMode = mode) {
  const result = spawnSync(
    process.execPath,
    [selectedMode === 'example' ? 'example/src/cli.js' : 'src/cli.js', ...args],
    { cwd: root, input, encoding: 'utf8', timeout: 10000 },
  );
  assert.equal(result.error, undefined);
  return result;
}
