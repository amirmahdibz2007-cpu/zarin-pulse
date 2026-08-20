import { describe, expect, it } from 'vitest';
import { recoverableSales, resolveAovBasis } from './aov-basis';

describe('resolveAovBasis', () => {
  it('uses own AOV when the merchant has verified orders', () => {
    const r = resolveAovBasis({
      verifiedOrders: 10,
      ownAov: 1_870_000,
      medianAttemptedAmount: 12_500_000,
      peerAov: 9_000_000,
    });
    expect(r.basis).toBe('own');
    expect(r.aov).toBe(1_870_000);
  });

  it('falls back to median attempted for a zero-verified merchant like M91', () => {
    const r = resolveAovBasis({
      verifiedOrders: 0,
      ownAov: null,
      medianAttemptedAmount: 12_500_000,
      peerAov: 9_000_000,
    });
    expect(r.basis).toBe('median_attempted');
    expect(r.aov).toBe(12_500_000);
  });
});

describe('recoverableSales', () => {
  it('returns a non-zero figure when AOV fallback is supplied', () => {
    const rec = recoverableSales({
      targetRate: 0.646,
      currentRate: 0,
      sessions: 3_393,
      aov: 12_500_000,
      captureRate: 0.5,
    });
    expect(rec).toBeGreaterThan(10_000_000_000);
  });

  it('is zero when the merchant is already above the peer p75', () => {
    expect(
      recoverableSales({
        targetRate: 0.5,
        currentRate: 0.76,
        sessions: 1000,
        aov: 1_000_000,
        captureRate: 0.5,
      }),
    ).toBe(0);
  });
});
