import { describe, expect, it } from 'vitest';
import { attributionShare, isAnomaly, madSigma } from './robust';

describe('robust anomaly', () => {
  it('flags a 60× spike like M27 on 2026-06-23', () => {
    const baseline = Array.from({ length: 30 }, () => 0.123);
    const sigma = madSigma(baseline);
    expect(isAnomaly(7.39, 0.123, sigma)).toBe(true);
  });
});

describe('attributionShare', () => {
  it('marks single_entity when one merchant is 97.1% of the excess', () => {
    const r = attributionShare([7.18, 0.12, 0.09]);
    expect(r.singleEntity).toBe(true);
    expect(r.max).toBeGreaterThan(0.9);
  });
});
