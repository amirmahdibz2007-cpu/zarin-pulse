import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildArtifacts } from './build.ts';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const committed = path.join(repoRoot, 'data', 'artifacts', 'manifest.json');

function readManifest(dir: string): { sourceSha256: string; files: Record<string, string> } {
  const raw = fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8');
  return JSON.parse(raw) as { sourceSha256: string; files: Record<string, string> };
}

async function main() {
  if (!fs.existsSync(committed)) {
    throw new Error('committed artifacts missing; run data:build first');
  }
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'zarinpulse-verify-'));
  try {
    await buildArtifacts(tmp);
    const a = readManifest(path.join(repoRoot, 'data', 'artifacts'));
    const b = readManifest(tmp);
    if (a.sourceSha256 !== b.sourceSha256) {
      throw new Error('sourceSha256 mismatch');
    }
    const keys = Object.keys(a.files).sort();
    for (const key of keys) {
      if (a.files[key] !== b.files[key]) {
        throw new Error(`artifact hash mismatch: ${key}`);
      }
    }
    console.log(`data:verify ok (${String(keys.length)} files)`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
