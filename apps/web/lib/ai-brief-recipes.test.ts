import { describe, expect, it } from 'vitest';
import type { MerchantArtifact } from './artifacts';
import {
  buildLockedForMerchant,
  deterministicAiBrief,
  groundedChatAnswer,
} from './ai-brief-recipes';

const sampleMerchant = {
  key: 'M31',
  category: 'مراکز آموزشی مجازی',
  sessions: 1000,
  verified: 200,
  success_rate: 0.2,
  revenue_rial: 100_000_000_000,
  health: 'healthy',
  tier: 'rich',
  recoverable_rial: 83_750_000_000,
  no_attempt: 100,
  in_bank: 700,
  failed: 0,
  paid_pending: 0,
  paid_amount_rial: 0,
  median_amount: 1,
  aov: 1,
  fee_actual: null,
  fee_expected: null,
  tariff_effect: null,
  fee_realized: 0,
  fee_potential: 0,
  peers: { n: 10, p75: 0.4, gap: 0.2 },
  impact: {
    currency: 'IRR',
    expected: 83_750_000_000,
    conservative: 0,
    optimistic: 0,
    basis: 'own',
  },
  pending: { currency: 'IRR', rial: 0 },
  series: {
    daily: [],
    jalali_months: [
      {
        key: '1404-04',
        days: 30,
        revenue_rial: 50_000_000_000,
        orders: 100,
        sessions: 500,
        per_day_revenue: 1,
        aov: 1,
      },
    ],
    weekdays: [
      { weekday: 0, sessions: 120, revenue_rial: 10_000_000_000, orders: 20, aov: 1 },
    ],
  },
} as MerchantArtifact;

describe('ai-brief-recipes', () => {
  it('builds richer deterministic overview with story beats', () => {
    const locked = buildLockedForMerchant(sampleMerchant, 'overview');
    expect(locked.story_beats.length).toBeGreaterThan(2);
    const answer = deterministicAiBrief(locked, sampleMerchant);
    expect(answer.summary.length).toBeGreaterThan(80);
    expect(answer.actions[0]?.title).toBe(locked.ranked_actions[0]?.title);
  });

  it('locks the full merchant dossier for grounded answers', () => {
    const locked = buildLockedForMerchant(sampleMerchant, 'chat', 'مشتری تکراری چند تاست؟');
    expect(locked.merchant_dossier.funnel).toBeTruthy();
    expect(locked.merchant_dossier.money).toBeTruthy();
    expect(locked.merchant_dossier.series).toBeTruthy();
    const series = locked.merchant_dossier.series as {
      jalali_months: unknown[];
      weekdays: unknown[];
    };
    expect(series.jalali_months.length).toBe(1);
    expect(series.weekdays.length).toBe(1);
    expect(locked.locked_metrics.peer_n).toBe(10);
  });

  it('why_drop mentions locked funnel ratios', () => {
    const locked = buildLockedForMerchant(sampleMerchant, 'why_drop');
    const answer = deterministicAiBrief(locked, sampleMerchant);
    expect(answer.summary).toContain(String(locked.locked_metrics.reached_bank_ratio));
  });

  it('answers day-of-month sales questions from peaks, not month funnel dump', () => {
    const m = {
      ...sampleMerchant,
      series: {
        ...sampleMerchant.series!,
        daily: [
          { day: '2026-01-04', sessions: 10, revenue_rial: 500_000_000, orders: 2 },
          { day: '2026-01-29', sessions: 20, revenue_rial: 1_100_000_000, orders: 5 },
          { day: '2026-02-04', sessions: 12, revenue_rial: 600_000_000, orders: 3 },
        ],
        weekdays: [
          { weekday: 1, sessions: 50, revenue_rial: 2_000_000_000, orders: 10, aov: 1 },
          { weekday: 0, sessions: 40, revenue_rial: 1_500_000_000, orders: 8, aov: 1 },
        ],
      },
    } as MerchantArtifact;
    const q = 'در چه روزهایی از ماه فروش بیشتری داشتم؟';
    const locked = buildLockedForMerchant(m, 'chat', q);
    expect(locked.merchant_dossier.sales_peaks).toBeTruthy();
    const answer = groundedChatAnswer(locked, m);
    expect(answer.summary).toContain('2026-01-29');
    expect(answer.summary).not.toContain('رهاشدن روی صفحه بانک');
    expect(answer.actions).toHaveLength(0);
  });
});
