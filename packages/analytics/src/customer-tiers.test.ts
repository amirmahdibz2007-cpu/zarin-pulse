import { describe, expect, it } from 'vitest';
import { assignCustomerTiers, inferIntervalDays } from './customer-tiers';

describe('assignCustomerTiers', () => {
  it('marks top cumulative 10% revenue as gold', () => {
    const cards = [
      { cardKey: 'A', orders: 5, revenueRial: 70, lastOrderIso: '2026-06-20', firstOrderIso: '2026-01-01' },
      { cardKey: 'B', orders: 3, revenueRial: 20, lastOrderIso: '2026-06-20', firstOrderIso: '2026-02-01' },
      { cardKey: 'C', orders: 1, revenueRial: 10, lastOrderIso: '2026-06-20', firstOrderIso: '2026-06-20' },
    ];
    const r = assignCustomerTiers(cards, '2026-06-30');
    expect(r.gold.map((c) => c.cardKey)).toEqual(['A']);
    expect(r.silver.map((c) => c.cardKey)).toEqual(['B']);
    expect(r.bronze.map((c) => c.cardKey)).toEqual(['C']);
    expect(r.summary.gold.share_of_revenue).toBeCloseTo(0.7, 5);
  });

  it('flags at-risk multi-order lapsed cards', () => {
    const cards = [
      {
        cardKey: 'L',
        orders: 4,
        revenueRial: 100,
        lastOrderIso: '2026-04-01',
        firstOrderIso: '2026-01-01',
      },
    ];
    const r = assignCustomerTiers(cards, '2026-06-30');
    expect(r.at_risk.map((c) => c.cardKey)).toEqual(['L']);
  });
});

describe('inferIntervalDays', () => {
  it('uses span between first and last order', () => {
    expect(
      inferIntervalDays({
        cardKey: 'x',
        orders: 3,
        revenueRial: 1,
        firstOrderIso: '2026-01-01',
        lastOrderIso: '2026-01-31',
      }),
    ).toBe(15);
  });
});
