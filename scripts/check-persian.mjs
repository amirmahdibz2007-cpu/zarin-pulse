import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PERSIAN = /[\u0600-\u06FF]/;
const SKIP_DIRS = new Set(['node_modules', '.next', 'dist', 'v2']);
const CODE_EXT = new Set(['.ts', '.tsx', '.js', '.mjs', '.css']);

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (CODE_EXT.has(path.extname(entry.name))) acc.push(full);
  }
  return acc;
}

/**
 * UI strings live in @zarinpulse/contracts copy deck.
 * Any Persian letter inside apps/web is a leak.
 */
export function findPersianLeaks(source) {
  const lines = source.split('\n');
  /** @type {{ line: number, text: string }[]} */
  const hits = [];
  for (let i = 0; i < lines.length; i += 1) {
    const text = lines[i];
    if (text !== undefined && PERSIAN.test(text)) {
      hits.push({ line: i + 1, text: text.trim() });
    }
  }
  return hits;
}

const isMain =
  process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const files = walk(path.join(root, 'apps', 'web'));
  let failed = false;
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    const hits = findPersianLeaks(source);
    if (hits.length > 0) {
      failed = true;
      console.error(`Persian UI leak (use copy deck): ${file}`);
      for (const hit of hits) {
        console.error(`  L${hit.line}: ${hit.text}`);
      }
    }
  }
  if (failed) process.exit(1);
  console.log('check-persian: ok');
}
