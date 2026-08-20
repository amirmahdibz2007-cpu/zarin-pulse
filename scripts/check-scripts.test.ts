import { describe, expect, it } from 'vitest';
import { findForbiddenScripts } from './check-scripts.mjs';
import { findLiteralFsPaths } from './check-paths.mjs';

describe('check-scripts', () => {
  it('rejects unix rm in an npm script', () => {
    const hits = findForbiddenScripts({ clean: 'rm -rf dist' });
    expect(hits.map((h) => h.id)).toContain('rm');
  });

  it('allows chained npm run scripts', () => {
    const hits = findForbiddenScripts({
      verify: 'npm run lint && npm run test',
    });
    expect(hits).toEqual([]);
  });

  it('rejects command substitution', () => {
    const hits = findForbiddenScripts({ bad: 'echo $(pwd)' });
    expect(hits.map((h) => h.id)).toContain('command-sub');
  });
});

describe('check-paths', () => {
  it('rejects readFileSync with a slash literal', () => {
    const hits = findLiteralFsPaths(`readFileSync('data/raw/file.csv')`);
    expect(hits).toEqual(['data/raw/file.csv']);
  });

  it('allows path.join then readFileSync on a variable', () => {
    const hits = findLiteralFsPaths(
      `readFileSync(path.join(root, 'data', 'raw', 'file.csv'))`,
    );
    expect(hits).toEqual([]);
  });
});
