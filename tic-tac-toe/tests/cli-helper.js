const { spawnSync } = require('node:child_process');
const path = require('node:path');

exports.cli = (input = '', args = []) =>
  spawnSync(
    process.execPath,
    [path.join(process.env.CHALLENGE_SOURCE, 'play.js'), 'ttt', ...args],
    { input, encoding: 'utf8', timeout: 5000 },
  );
