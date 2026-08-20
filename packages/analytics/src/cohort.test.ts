import { describe, expect, it } from 'vitest';
import { classifyBusinessModel, customerAtRisk } from './cohort';

describe('classifyBusinessModel', () => {
  it('labels M27-style repeat as subscription_like', () => {
    expect(
      classifyBusinessModel({
        repeatCustomerShare: 0.723,
        medianGapDays: 30,
        verifiedOrders: 1_838,
      }),
    ).toBe('subscription_like');
  });

  it('labels M319-style as one_shot', () => {
    expect(
      classifyBusinessModel({
        repeatCustomerShare: 0.005,
        medianGapDays: 90,
        verifiedOrders: 598,
      }),
    ).toBe('one_shot');
  });
});

describe('customerAtRisk', () => {
  it('flags a lapsed subscriber and ignores a recent order', () => {
    expect(
      customerAtRisk({ lastOrderIso: '2026-05-01', intervalDays: 30, dataEndIso: '2026-06-30' }),
    ).toBe(true);
    expect(
      customerAtRisk({ lastOrderIso: '2026-06-25', intervalDays: 30, dataEndIso: '2026-06-30' }),
    ).toBe(false);
  });
});
