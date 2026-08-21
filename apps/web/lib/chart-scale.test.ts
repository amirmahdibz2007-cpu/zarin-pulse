import { describe, expect, it } from 'vitest';
import { insetBarPercents, vialFillPercent } from './chart-scale';

describe('insetBarPercents', () => {
  it('spreads clustered weekday counts instead of pinning them to the ceiling', () => {
    const week = [303084, 310380, 291292, 280156, 288249, 287854, 301824];
    const pct = insetBarPercents(week);
    const shortest = Math.min(...pct);
    const tallest = Math.max(...pct);
    expect(tallest).toBeCloseTo(100, 5);
    expect(shortest).toBeGreaterThan(40);
    expect(shortest).toBeLessThan(70);
    expect(pct[1]!).toBeGreaterThan(pct[3]!);
  });

  it('keeps a zero floor when values already span the axis', () => {
    const pct = insetBarPercents([10, 50, 100]);
    expect(pct[0]).toBeCloseTo(10, 5);
    expect(pct[2]).toBeCloseTo(100, 5);
  });
});

describe('vialFillPercent', () => {
  it('keeps failed and paid distinguishable against verified', () => {
    const max = 1_025_627;
    const failed = vialFillPercent(30_939, max);
    const paid = vialFillPercent(8_716, max);
    expect(failed).toBeGreaterThan(paid);
    expect(paid).toBeLessThan(6);
    expect(vialFillPercent(0, max)).toBe(0);
  });
});
