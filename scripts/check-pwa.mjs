import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = path.join(root, 'apps', 'web', 'public');
const required = ['icon-192.png', 'icon-512.png', 'icon-maskable.png', 'sw.js', 'offline.html'];

let failed = false;
for (const name of required) {
  const full = path.join(pub, name);
  if (!fs.existsSync(full)) {
    console.error(`check-pwa: missing ${full}`);
    failed = true;
  }
}
const apple = path.join(root, 'apps', 'web', 'app', 'apple-icon.png');
if (!fs.existsSync(apple)) {
  console.error(`check-pwa: missing ${apple}`);
  failed = true;
}
if (failed) process.exit(1);
console.log('check-pwa: ok');
