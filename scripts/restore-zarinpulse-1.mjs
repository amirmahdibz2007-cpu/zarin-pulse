#!/usr/bin/env node
/**
 * Restore the locked "زرین پالس ۱" baseline (git tag zarinpulse-1).
 * Usage: node scripts/restore-zarinpulse-1.mjs
 */
import { execSync } from 'node:child_process';

const tag = 'zarinpulse-1';
try {
  execSync(`git rev-parse ${tag}^{commit}`, { stdio: 'pipe' });
} catch {
  console.error(`Tag ${tag} not found. Cannot restore.`);
  process.exit(1);
}
execSync(`git reset --hard ${tag}`, { stdio: 'inherit' });
const head = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
console.log(`Restored زرین پالس ۱ → ${head} (${tag})`);
