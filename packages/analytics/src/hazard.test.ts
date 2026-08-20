import { describe, expect, it } from 'vitest';
import { optimalRetryCap, retryHazard } from './hazard';

describe('retryHazard', () => {
  it('reproduces h(1)=54.81% and h(2)=41.73%', () => {
    const h1 = retryHazard(1_798_903, 985_973);
    const h2 = retryHazard(72_432, 30_224);
    expect(h1.h).toBeCloseTo(0.5481, 4);
    expect(h2.h).toBeCloseTo(0.4173, 4);
    expect(h1.ci).not.toBeNull();
    expect(h2.insufficient).toBe(false);
  });

  it('is insufficient below 100 at-risk', () => {
    const r = retryHazard(40, 10);
    expect(r.insufficient).toBe(true);
    expect(r.ci).toBeNull();
  });
});

describe('optimalRetryCap', () => {
  it('caps at the last k with at least 1% hazard and 100 at-risk', () => {
    const cap = optimalRetryCap([
      { k: 1, h: 0.5481, atRisk: 1_798_903 },
      { k: 2, h: 0.4173, atRisk: 72_432 },
      { k: 25, h: 0, atRisk: 400 },
    ]);
    expect(cap).toBe(2);
  });
});
