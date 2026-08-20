import { describe, expect, it } from 'vitest';
import { wilsonInterval, wilsonPoint } from './wilson';

describe('wilsonInterval', () => {
  it('matches a known 95% interval for 985973/1798903 (h(1))', () => {
    const p = wilsonPoint(985_973, 1_798_903);
    expect(p).toBeCloseTo(0.5481, 4);
    const [lo, hi] = wilsonInterval(985_973, 1_798_903);
    expect(lo).toBeGreaterThan(0.54);
    expect(hi).toBeLessThan(0.56);
    expect(lo).toBeLessThan(p);
    expect(hi).toBeGreaterThan(p);
  });

  it('collapses toward 0 and 1 at the extremes', () => {
    const [lo0] = wilsonInterval(0, 100);
    const [, hi1] = wilsonInterval(100, 100);
    expect(lo0).toBeGreaterThanOrEqual(0);
    expect(hi1).toBeLessThanOrEqual(1);
  });

  it('rejects invalid input', () => {
    expect(() => wilsonInterval(2, 1)).toThrow(RangeError);
    expect(() => wilsonInterval(0, 0)).toThrow(RangeError);
  });
});
