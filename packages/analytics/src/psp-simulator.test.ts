import { describe, expect, it } from 'vitest';
import { simulatePspShift } from './psp-simulator';

describe('simulatePspShift', () => {
  it('uses within-category rates, not the global ranking', () => {
    const globalWouldBeNegative = simulatePspShift({
      sessions: 10_000,
      deltaShare: 1,
      bands: [{ weight: 1, pFrom: 0.71, pTo: 0.419 }],
    });
    const withinCategory = simulatePspShift({
      sessions: 10_000,
      deltaShare: 1,
      bands: [{ weight: 1, pFrom: 0.63, pTo: 0.71 }],
    });
    expect(globalWouldBeNegative).toBeLessThan(0);
    expect(withinCategory).toBeCloseTo(800, 6);
  });
});
