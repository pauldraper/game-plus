/** Optional npm adapter; native Python commands do not require this wrapper. */
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const candidates = process.env.PYTHON
    ? [[process.env.PYTHON, []]]
    : [
          ['python3', []],
          ['python', []],
          ['py', ['-3']],
      ];
for (const [executable, prefix] of candidates) {
    const probe = spawnSync(
        executable,
        [...prefix, '-c', 'import sys; sys.exit(0 if sys.version_info >= (3, 11) else 1)'],
        { encoding: 'utf8' },
    );
    if (probe.error || probe.status !== 0) continue;
    const result = spawnSync(executable, [...prefix, 'scripts/run.py', ...process.argv.slice(2)], {
        cwd: root,
        stdio: 'inherit',
    });
    if (result.error) throw result.error;
    process.exit(result.status || (result.signal ? 1 : 0));
}
console.error(
    'Python 3.11 or later was not found. Install Python or set PYTHON to its executable.',
);
process.exit(2);
