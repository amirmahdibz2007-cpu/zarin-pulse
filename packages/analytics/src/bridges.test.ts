import { describe, expect, it } from 'vitest';
import { customerBridge, kitagawa, successGapDecompose, volumePriceBridge } from './bridges';

describe('volumePriceBridge', () => {
  it('identity holds to the rial', () => {
    const r = volumePriceBridge(100, 5_000_000, 120, 5_500_000);
    expect(r.identity).toBe(r.delta);
    expect(r.delta).toBe(120 * 5_500_000 - 100 * 5_000_000);
  });
});

describe('customerBridge', () => {
  it('requires parts to equal the revenue change', () => {
    const ok = customerBridge(
      { newly: 10, resurrected: 5, expansion: 3, contraction: 2, churned: 4 },
      100,
      112,
    );
    expect(ok.composed).toBe(12);
    expect(ok.ok).toBe(true);
  });
});

describe('successGapDecompose', () => {
  it('identity holds', () => {
    const r = successGapDecompose(0.2, 0.5, 0.1, 0.6);
    expect(r.identity).toBeCloseTo(r.gap, 12);
  });
});

describe('kitagawa', () => {
  it('sums to the observed rate gap', () => {
    const strata = [
      { weightM: 0.7, weightP: 0.4, rateM: 0.2, rateP: 0.5 },
      { weightM: 0.3, weightP: 0.6, rateM: 0.4, rateP: 0.6 },
    ];
    const r = kitagawa(strata);
    const sM = 0.7 * 0.2 + 0.3 * 0.4;
    const sP = 0.4 * 0.5 + 0.6 * 0.6;
    expect(r.gap).toBeCloseTo(sP - sM, 12);
  });
});
