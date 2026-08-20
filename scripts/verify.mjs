import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function fail(message) {
  console.error(message);
  process.exit(1);
}

/**
 * Run a workspace command without a shell so Windows and Linux behave the same.
 */
function run(args) {
  const result = spawnSync(npmCmd, args, {
    cwd: root,
    stdio: 'inherit',
    shell: false,
    env: process.env,
  });
  if (result.error) fail(String(result.error));
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function runNode(scriptName, nodeArgs = []) {
  const result = spawnSync(process.execPath, [...nodeArgs, path.join(root, 'scripts', scriptName)], {
    cwd: root,
    stdio: 'inherit',
    shell: false,
    env: process.env,
  });
  if (result.error) fail(String(result.error));
  if (result.status !== 0) process.exit(result.status ?? 1);
}

runNode('check-scripts.mjs');
runNode('check-paths.mjs');
runNode('check-persian.mjs');
runNode('check-pwa.mjs');
run(['exec', '--', 'tsc', '--noEmit', '-p', 'tsconfig.json', '--pretty', 'false']);
run(['exec', '--', 'tsc', '--noEmit', '-p', 'apps/web/tsconfig.json', '--pretty', 'false']);
run(['exec', '--', 'eslint', '.']);
run(['exec', '--', 'vitest', 'run']);
runNode('gen-metrics-md.mjs', ['--experimental-strip-types']);
