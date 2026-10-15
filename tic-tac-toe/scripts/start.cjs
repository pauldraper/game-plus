/** Builds and launches the explicitly selected implementation. */
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const [target, ...args] = process.argv.slice(2);
if (!['starter', 'example'].includes(target)) {
  console.error('Usage: node scripts/start.cjs starter|example [CLI options]');
  process.exit(2);
}
const compiler = require.resolve('typescript/bin/tsc', { paths: [root] });
const build = spawnSync(
  process.execPath,
  [compiler, '-p', target === 'example' ? 'example' : '.'],
  {
    cwd: root,
    stdio: 'inherit',
  },
);
if (build.error) throw build.error;
if (build.status !== 0) process.exit(build.status || 1);
// Retain the old "example ttt" spelling while making the game name optional.
if (args[0] === 'ttt') args.shift();
const entry = path.join(root, target === 'example' ? 'example' : '.', 'lib', 'play.js');
const result = spawnSync(process.execPath, [entry, 'ttt', ...args], {
  cwd: root,
  stdio: 'inherit',
});
if (result.error) throw result.error;
process.exit(result.status || (result.signal ? 1 : 0));
