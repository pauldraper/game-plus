const path = require('node:path');

// Run the same behavior contract against the starter or the completed example.
const build = process.env.CHALLENGE_SOURCE;
if (!build) throw new Error('Run tests through scripts/test.cjs with an explicit target');
exports.game = require(path.join(build, 'index.js'));
exports.utils = require(path.join(build, 'utils.js'));
exports.Player = require(path.join(build, 'game.js')).Player;
exports.Minimax = require(path.join(build, 'minimax.js')).Minimax;
exports.runCli = require(path.join(build, 'play.js')).runCli;
exports.ConsoleActor = require(path.join(build, 'console.js')).ConsoleActor;
exports.InvalidMoveError = require(path.join(build, 'game.js')).InvalidMoveError;
exports.NotImplementedError = require(path.join(build, 'game.js')).NotImplementedError;
