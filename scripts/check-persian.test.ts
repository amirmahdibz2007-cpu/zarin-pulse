import { describe, expect, it } from 'vitest';
import { findPersianLeaks } from './check-persian.mjs';

describe('check-persian', () => {
  it('flags a Persian string in a component', () => {
    const hits = findPersianLeaks('export const x = "خانه";');
    expect(hits).toHaveLength(1);
    expect(hits[0]?.line).toBe(1);
  });

  it('allows copy-deck imports with Latin-only source', () => {
    const hits = findPersianLeaks(
      `import { copy } from '@zarinpulse/contracts';\nexport const t = copy.product.name;`,
    );
    expect(hits).toEqual([]);
  });
});
