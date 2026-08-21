import { describe, expect, it } from 'vitest';
import { sumMerchantPeriod, type MerchantSeries } from './merchant-periods';

const series: MerchantSeries = {
  daily: [
    { day: '2026-06-20', revenue_rial: 100, orders: 1 },
    { day: '2026-06-21', revenue_rial: 200, orders: 2 },
    { day: '2026-06-22', revenue_rial: 300, orders: 3 },
    { day: '2026-06-23', revenue_rial: 400, orders: 4 },
    { day: '2026-06-24', revenue_rial: 500, orders: 5 },
    { day: '2026-06-25', revenue_rial: 600, orders: 6 },
    { day: '2026-06-26', revenue_rial: 700, orders: 7 },
  ],
  jalali_months: [
    { key: '1405-01', revenue_rial: 1000, orders: 10, days: 30 },
    { key: '1405-02', revenue_rial: 2000, orders: 20, days: 31 },
    { key: '1405-03', revenue_rial: 3000, orders: 30, days: 31 },
    { key: '1405-04', revenue_rial: 4000, orders: 40, days: 9 },
  ],
};

describe('sumMerchantPeriod', () => {
  it('sums the last seven calendar days for week', () => {
    const r = sumMerchantPeriod(series, 'week');
    expect(r.revenue_rial).toBe(2800);
    expect(r.partial).toBe(false);
  });

  it('uses the latest jalali month for month', () => {
    const r = sumMerchantPeriod(series, 'month');
    expect(r.revenue_rial).toBe(4000);
    expect(r.monthKeys).toEqual(['1405-04']);
    expect(r.partial).toBe(true);
  });

  it('marks year as partial when fewer than 12 months exist', () => {
    const r = sumMerchantPeriod(series, 'year');
    expect(r.revenue_rial).toBe(10000);
    expect(r.partial).toBe(true);
  });
});
