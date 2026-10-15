/** Explicit solution entry point; the supplied shell is shared with the starter. */
import { main } from '../../src/cli.js';

main(process.argv.slice(2), 'example').catch((error) => {
  console.error(error.stack ?? String(error));
  process.exitCode = 1;
});
