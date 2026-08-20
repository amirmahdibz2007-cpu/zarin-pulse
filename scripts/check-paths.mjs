import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CODE_EXT = new Set(['.ts', '.tsx', '.mjs', '.js']);
const SKIP_DIRS = new Set(['node_modules', '.git', '.next', 'dist', 'coverage', 'v2']);

/**
 * fs calls that must not take a string literal path containing / or \\.
 * Callers must go through node:path join/resolve.
 */
const FS_CALL =
  /\b(?:readFileSync|writeFileSync|appendFileSync|rmSync|mkdirSync|readdirSync|statSync|accessSync|readFile|writeFile|appendFile|rm|mkdir|readdir|stat|access)\(\s*(['"`])([^'"`]*[\\/][^'"`]*)\1/g;

export function findLiteralFsPaths(source) {
  /** @type {string[]} */
  const hits = [];
  for (const match of source.matchAll(FS_CALL)) {
    const literal = match[2];
    if (literal === undefined) continue;
    hits.push(literal);
  }
  return hits;
}

function walk(dir, acc = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (CODE_EXT.has(path.extname(entry.name))) acc.push(full);
  }
  return acc;
}

export function scanTree(rootDir) {
  const files = walk(rootDir);
  /** @type {{ file: string, literal: string }[]} */
  const all = [];
  for (const file of files) {
    if (file.endsWith('.test.ts') || file.endsWith('.test.tsx')) continue;
    const source = fs.readFileSync(file, 'utf8');
    for (const literal of findLiteralFsPaths(source)) {
      all.push({ file, literal });
    }
  }
  return all;
}

const isMain =
  process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const hits = scanTree(root);
  if (hits.length > 0) {
    console.error('Hardcoded filesystem paths (use node:path join/resolve):');
    for (const hit of hits) {
      console.error(`  ${hit.file}  "${hit.literal}"`);
    }
    process.exit(1);
  }
  console.log('check-paths: ok');
}
