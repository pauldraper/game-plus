/** Checks actual projects and pinned templates without producing build files. */
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const compiler = require.resolve('typescript/bin/tsc', { paths: [root] });
for (const project of ['.', 'example', 'starter']) {
  if (!fs.existsSync(path.join(root, project, 'tsconfig.json'))) continue;
  console.log('Type checking: ' + project);
  const result = spawnSync(process.execPath, [compiler, '-p', project, '--noEmit'], {
    cwd: root, stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
