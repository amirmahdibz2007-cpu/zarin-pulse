import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Unix-shell tokens that break `npm run` on Windows.
 * `&&` between npm scripts is allowed; these tokens are not.
 */
export const FORBIDDEN = [
  { id: 'rm', re: /(?:^|[\s;&|])rm(?:\s|$)/ },
  { id: 'cp', re: /(?:^|[\s;&|])cp(?:\s|$)/ },
  { id: 'mv', re: /(?:^|[\s;&|])mv(?:\s|$)/ },
  { id: 'mkdir', re: /(?:^|[\s;&|])mkdir(?:\s|$)/ },
  { id: 'export', re: /(?:^|[\s;&|])export(?:\s|$)/ },
  { id: 'command-sub', re: /\$\(/ },
  { id: 'backtick', re: /`/ },
  { id: 'cat', re: /(?:^|[\s;&|])cat(?:\s|$)/ },
  { id: 'chmod', re: /(?:^|[\s;&|])chmod(?:\s|$)/ },
];

export function findForbiddenScripts(scripts) {
  /** @type {{ name: string, command: string, id: string }[]} */
  const hits = [];
  for (const [name, command] of Object.entries(scripts ?? {})) {
    if (typeof command !== 'string') continue;
    for (const rule of FORBIDDEN) {
      if (rule.re.test(command)) {
        hits.push({ name, command, id: rule.id });
      }
    }
  }
  return hits;
}

function collectPackageJsonFiles(dir, acc = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.next' || entry.name === 'v2') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectPackageJsonFiles(full, acc);
    else if (entry.name === 'package.json') acc.push(full);
  }
  return acc;
}

export function scanWorkspace(rootDir) {
  const files = collectPackageJsonFiles(rootDir);
  /** @type {{ file: string, name: string, command: string, id: string }[]} */
  const all = [];
  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf8');
    const pkg = JSON.parse(raw);
    for (const hit of findForbiddenScripts(pkg.scripts ?? {})) {
      all.push({ file, ...hit });
    }
  }
  return all;
}

const isMain =
  process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const hits = scanWorkspace(root);
  if (hits.length > 0) {
    console.error('Forbidden shell tokens in npm scripts (Windows-incompatible):');
    for (const hit of hits) {
      console.error(`  ${hit.file}  scripts.${hit.name}  [${hit.id}]  ${hit.command}`);
    }
    process.exit(1);
  }
  console.log('check-scripts: ok');
}
