#!/usr/bin/env node
/**
 * Restore the locked "زرین پالس ۲" baseline (git tag zarinpulse-2).
 * Usage: node scripts/restore-zarinpulse-2.mjs
 */
import { execSync } from 'node:child_process';

const tag = 'zarinpulse-2';
try {
  execSync(`git rev-parse ${tag}^{commit}`, { stdio: 'pipe' });
} catch {
  console.error(`Tag ${tag} not found. Cannot restore.`);
  process.exit(1);
}
execSync(`git reset --hard ${tag}`, { stdio: 'inherit' });
const head = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
console.log(`Restored زرین پالس ۲ → ${head} (${tag})`);
