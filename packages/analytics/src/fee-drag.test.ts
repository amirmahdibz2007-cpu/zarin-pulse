import { describe, expect, it } from 'vitest';
import { expectedFeeRate, logAmountBand, maxAdjacentRatio, tariffEffect } from './fee-drag';

describe('fee-drag', () => {
  it('puts 100_000 rial in the 1e5 log band', () => {
    expect(logAmountBand(100_000)).toBe(5);
  });

  it('reproduces M106 actual rate and a positive tariff surcharge', () => {
    const actual = 0.08113;
    const expectedQuarterLog = 0.0594;
    expect(tariffEffect(actual, expectedQuarterLog)).toBeGreaterThan(0.01);
    expect(actual).toBeCloseTo(0.08113, 5);
  });

  it('weights the reference curve by basket mix', () => {
    const ref = new Map([
      [5, 0.02524],
      [6, 0.00455],
    ]);
    const rate = expectedFeeRate(
      [
        { band: 5, weight: 1 },
        { band: 6, weight: 0 },
      ],
      ref,
    );
    expect(rate).toBeCloseTo(0.02524, 5);
  });

  it('log-band rates do not invert as violently as the failed decile curve', () => {
    // Platform-wide effective rates by log amount band from the data constitution.
    const logBands = [0.48, 0.141333, 0.00455, 0.001964, 0.005154, 0.001574];
    const decilesThatBroke = [0.01079, 0.00257];
    expect(maxAdjacentRatio(logBands)).toBeLessThan(maxAdjacentRatio(decilesThatBroke) * 20);
    expect(maxAdjacentRatio(decilesThatBroke)).toBeGreaterThan(4);
  });
});
