import { describe, expect, it } from 'vitest';
import { amountBandId, summarizeAmountBands } from './amount-bands';

describe('amountBandId', () => {
  it('buckets rial amounts', () => {
    expect(amountBandId(100_000)).toBe('lt_0_5m');
    expect(amountBandId(1_000_000)).toBe('0_5_2m');
    expect(amountBandId(3_000_000)).toBe('2_5m');
    expect(amountBandId(7_000_000)).toBe('5_10m');
    expect(amountBandId(12_000_000)).toBe('10m_plus');
  });
});

describe('summarizeAmountBands', () => {
  it('computes success rates per band', () => {
    const rows = [
      { amountRial: 1_000_000, verified: true },
      { amountRial: 1_000_000, verified: false },
      { amountRial: 3_000_000, verified: false },
      { amountRial: 3_000_000, verified: false },
    ];
    const bands = summarizeAmountBands(rows);
    const mid = bands.find((b) => b.id === '0_5_2m')!;
    const high = bands.find((b) => b.id === '2_5m')!;
    expect(mid.success_rate).toBeCloseTo(0.5);
    expect(high.success_rate).toBe(0);
    expect(mid.revenue_rial).toBe(1_000_000);
  });
});
