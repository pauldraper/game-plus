import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { source } from './implementation.js';

export function cli(input = '', args = []) {
  return spawnSync(process.execPath, [resolve(source, 'cli.js'), ...args], {
    cwd: fileURLToPath(new URL('..', import.meta.url)),
    input,
    encoding: 'utf8',
    timeout: 5000,
  });
}
