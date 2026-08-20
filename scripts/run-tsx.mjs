import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tsxCli = path.join(root, 'node_modules', 'tsx', 'dist', 'cli.mjs');
if (!fs.existsSync(tsxCli)) {
  console.error('tsx is missing. Run npm install.');
  process.exit(1);
}

const target = process.argv[2];
if (typeof target !== 'string') {
  console.error('usage: node scripts/run-tsx.mjs <relative-ts-file>');
  process.exit(1);
}

const result = spawnSync(process.execPath, [tsxCli, path.join(root, target)], {
  cwd: root,
  stdio: 'inherit',
  shell: false,
  env: process.env,
});
process.exit(result.status ?? 1);
