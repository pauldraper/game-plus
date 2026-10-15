// Explicit target selection is controlled here, never by an inherited environment setting.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const [target, suite = 'all', ...extra] = process.argv.slice(2);
const allowed = ['all', 'setup', 'rules', 'game', 'cli', 'ai', 'verification'];
if (!['starter', 'example'].includes(target) || !allowed.includes(suite) || extra.length) {
  console.error(
    'Usage: node scripts/test.cjs starter|example [all|setup|rules|game|cli|ai|verification]',
  );
  process.exit(2);
}
const typescript = fs.existsSync(path.join(root, 'tsconfig.json'));
const implementation = path.join(
  root,
  target === 'example' ? 'example' : '.',
  typescript ? 'lib' : 'src',
);
console.log('Testing ' + target + ': ' + implementation + ' (' + suite + ')');
if (typescript) {
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
}
const groups = {
  setup: ['setup.test.js', 'cli-shell.test.js', 'cli-setup.test.js'].filter((name) =>
    fs.existsSync(path.join(root, 'tests', name)),
  ),
  rules: ['rules.test.js'],
  game: ['game.test.js'],
  cli: ['cli-shell.test.js', 'cli-setup.test.js', 'cli-game.test.js', 'cli.test.js'].filter(
    (name) => fs.existsSync(path.join(root, 'tests', name)),
  ),
  ai: ['ai.test.js'],
};
let files =
  suite === 'all'
    ? fs
        .readdirSync(path.join(root, 'tests'))
        .filter((name) => name.endsWith('.test.js') && name !== 'ai.test.js')
    : groups[suite] || [];
files = files.map((file) => path.join(root, 'tests', file));
if (target === 'example' && (suite === 'all' || suite === 'verification')) {
  const verification = path.join(root, 'example', 'verification');
  if (fs.existsSync(verification)) {
    files.push(
      ...fs
        .readdirSync(verification)
        .filter(
          (name) => name.endsWith('.test.js') || (suite === 'verification' && name === 'verify.js'),
        )
        .map((name) => path.join(verification, name)),
    );
  }
}
if (files.length === 0 || files.some((file) => !fs.existsSync(file))) {
  console.error('This challenge has no ' + suite + ' suite for ' + target);
  process.exit(2);
}
const env = { ...process.env, CHALLENGE_SOURCE: implementation, CHALLENGE_TARGET: target };
for (const key of ['TTT_IMPLEMENTATION', 'CONNECT_FOUR_IMPL', 'MINES_IMPLEMENTATION'])
  delete env[key];
const result = spawnSync(process.execPath, ['--test', ...files.sort()], {
  cwd: root,
  env,
  stdio: 'inherit',
});
if (result.error) throw result.error;
process.exit(result.status || (result.signal ? 1 : 0));
