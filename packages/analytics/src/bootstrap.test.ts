import { describe, expect, it } from 'vitest';
import { bootstrapMean, createXorshift128Plus, fnv1a } from './bootstrap';

describe('fnv1a + xorshift', () => {
  it('is deterministic for the same seed', () => {
    const a = createXorshift128Plus(fnv1a('retry_hazard|1.0.0|platform'));
    const b = createXorshift128Plus(fnv1a('retry_hazard|1.0.0|platform'));
    expect(a.next()).toBe(b.next());
    expect(a.next()).toBe(b.next());
  });

  it('changes when the scope key changes', () => {
    const a = createXorshift128Plus(fnv1a('m|1|M31'));
    const b = createXorshift128Plus(fnv1a('m|1|M250'));
    expect(a.next()).not.toBe(b.next());
  });
});

describe('bootstrapMean', () => {
  it('reproduces the same interval for the same seed', () => {
    const sample = [1, 2, 3, 4, 5, 10, 12];
    const x = bootstrapMean(sample, 200, fnv1a('test|1|a'));
    const y = bootstrapMean(sample, 200, fnv1a('test|1|a'));
    expect(x).toEqual(y);
    expect(x.lo).toBeLessThanOrEqual(x.mean);
    expect(x.hi).toBeGreaterThanOrEqual(x.mean);
  });
});
