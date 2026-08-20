import { buildArtifacts } from './build.ts';

const command = process.argv[2] ?? 'build';
if (command !== 'build') {
  console.error(`unknown etl command: ${command}`);
  process.exit(1);
}

buildArtifacts()
  .then(() => {
    console.log('etl: artifacts written');
  })
  .catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });
