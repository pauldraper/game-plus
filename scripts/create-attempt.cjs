/**
 * Creates a standalone attempt without overwriting work. Editable challenge
 * files come from pinned stubs; supplied scaffolding and tests stay current.
 */
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const challenges = require('./challenges.cjs');

const root = path.resolve(__dirname, '..');
const [game, ...args] = process.argv.slice(2);
let requestedName;
let outputDirectory;
let invalidOptions = false;
// Options can appear before or after the optional name. Validate all arguments
// before creating directories so malformed calls cannot leave partial attempts.
for (let index = 0; index < args.length; index++) {
  const argument = args[index];
  if (argument === '--output') {
    const value = args[++index];
    if (outputDirectory !== undefined || !value || !value.trim() || value.startsWith('--')) {
      invalidOptions = true;
      break;
    }
    outputDirectory = value;
  } else if (argument.startsWith('-') || requestedName !== undefined) {
    invalidOptions = true;
    break;
  } else {
    requestedName = argument;
  }
}
if (
  !challenges.includes(game) ||
  (requestedName !== undefined && !/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,63}$/.test(requestedName)) ||
  invalidOptions
) {
  console.error(
    'Usage: node scripts/create-attempt.cjs ' +
      challenges.join('|') +
      ' [name] [--output directory]',
  );
  process.exit(2);
}
const name =
  requestedName ||
  game + '-' + new Date().toISOString().replace(/[:.]/g, '-') + '-' + randomUUID().slice(0, 8);
const parent =
  outputDirectory !== undefined ? path.resolve(outputDirectory) : path.join(root, 'attempts');
const destination = path.join(parent, name);
const source = path.join(root, game);
// Python keeps its standard-library-only generator, pinned stubs, and baseline hashes.
if (fs.existsSync(path.join(source, 'src', 'cli.py'))) {
  const { spawnSync } = require('node:child_process');
  const result = spawnSync(
    process.execPath,
    [path.join(source, 'scripts', 'run.cjs'), 'practice:new', name, '--output', parent],
    { stdio: 'inherit' },
  );
  if (result.error) throw result.error;
  process.exit(result.status || (result.signal ? 1 : 0));
}
fs.mkdirSync(parent, { recursive: true });
try {
  fs.mkdirSync(destination);
} catch (error) {
  if (error.code === 'EEXIST') {
    console.error('Attempt already exists; choose another name: ' + destination);
    process.exit(1);
  }
  throw error;
}
for (const entry of ['src', 'tests', 'scripts', 'scenarios', 'tsconfig.json', 'yarn.lock']) {
  const file = path.join(source, entry);
  if (fs.existsSync(file)) fs.cpSync(file, path.join(destination, entry), { recursive: true });
}
// Pin only editable stubs: a candidate's solution never becomes the next starter.
for (const file of fs.readdirSync(path.join(source, 'starter', 'src'))) {
  fs.copyFileSync(path.join(source, 'starter', 'src', file), path.join(destination, 'src', file));
}
for (const file of ['.prettierrc', '.prettierignore', '.editorconfig', '.gitignore', '.nvmrc']) {
  fs.copyFileSync(path.join(root, file), path.join(destination, file));
}
const license = fs.existsSync(path.join(source, 'LICENSE'))
  ? path.join(source, 'LICENSE')
  : path.join(root, 'LICENSE');
fs.copyFileSync(license, path.join(destination, 'LICENSE'));
const manifest = JSON.parse(fs.readFileSync(path.join(source, 'package.json'), 'utf8'));
manifest.name = game + '-attempt';
manifest.private = true;
for (const key of Object.keys(manifest.scripts)) {
  if (key.includes('example') || key === 'practice:new') delete manifest.scripts[key];
}
if (manifest.scripts.format)
  manifest.scripts.format = manifest.scripts.format.replace('../.prettierrc', '.prettierrc');
fs.writeFileSync(path.join(destination, 'package.json'), JSON.stringify(manifest, null, 2) + '\n');
fs.mkdirSync(path.join(destination, 'docs'));
for (const file of ['CHALLENGE.md', 'SESSION-NOTES.md']) {
  fs.copyFileSync(path.join(source, 'docs', file), path.join(destination, 'docs', file));
}
const setup =
  game === 'tic-tac-toe'
    ? '    yarn install\n    npm run test:setup\n    npm start'
    : '    npm run test:setup\n    npm start';
fs.writeFileSync(
  path.join(destination, 'README.md'),
  '# ' +
    game +
    ' — Fresh Attempt\n\n' +
    'Read [the challenge contract](docs/CHALLENGE.md) before editing. ' +
    'This attempt contains no completed example, dependencies, or build output.\n\n' +
    'Use Node.js 22 or later. From this directory:\n\n' +
    setup +
    '\n\n' +
    'Run setup checks before starting your timer. Rule-dependent tests fail until the stubs are implemented. ' +
    'Record results in [the session worksheet](docs/SESSION-NOTES.md).\n',
);
console.log('Created fresh ' + game + ' attempt: ' + destination);
console.log('Previous attempts and challenge files were not changed.');
