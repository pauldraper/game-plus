/** Explicit solution entry point; only example rules and actions are selected. */
import { main } from '../../src/cli.js';

main(process.argv.slice(2), 'example').catch((error) => {
  console.error(`Unexpected error: ${error.stack || error.message}`);
  process.exitCode = 1;
});
