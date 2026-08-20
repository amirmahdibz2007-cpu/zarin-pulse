import { describe, expect, it } from 'vitest';
import { assignImpactFamily, impactUnionOk } from './impact-ledger';

describe('assignImpactFamily', () => {
  it('sends a broken gateway to the first family', () => {
    expect(
      assignImpactFamily({
        health: 'pattern_1_no_bank_reach',
        noAttemptRate: 1,
        inBankRate: 0,
        uniquePrices: 12,
      }),
    ).toBe('gateway_broken');
  });
});

describe('impact union', () => {
  it('requires case rials to equal recoverable total with no double count', () => {
    const cases = [
      { impactRial: 88_920_000_000 },
      { impactRial: 13_710_000_000 },
    ];
    expect(impactUnionOk(cases, 102_630_000_000)).toBe(true);
    expect(impactUnionOk(cases, 102_630_000_001)).toBe(false);
  });
});
