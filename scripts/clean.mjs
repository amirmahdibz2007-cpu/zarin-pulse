import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const targets = [
  path.join(root, 'node_modules'),
  path.join(root, 'apps', 'web', '.next'),
  path.join(root, 'apps', 'web', 'node_modules'),
  path.join(root, 'packages', 'contracts', 'dist'),
  path.join(root, 'coverage'),
];

for (const target of targets) {
  fs.rmSync(target, { recursive: true, force: true });
}
