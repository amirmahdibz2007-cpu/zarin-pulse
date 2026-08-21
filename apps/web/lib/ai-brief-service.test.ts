import { describe, expect, it } from 'vitest';
import type { MerchantArtifact } from './artifacts';
import { createAiBriefCache } from './ai-brief-cache';
import { resolveAiBrief, type AiBriefDeps } from './ai-brief-service';
import { buildMerchantActions } from './merchant-actions';

const sampleMerchant = {
  key: 'M31',
  category: 'مراکز آموزشی مجازی',
  sessions: 1000,
  verified: 200,
  success_rate: 0.2,
  revenue_rial: 100_000_000_000,
  health: 'healthy',
  tier: 'rich' as const,
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
    weekdays: [],
  },
} as MerchantArtifact;

function deps(overrides: Partial<AiBriefDeps> = {}): AiBriefDeps {
  return {
    readMerchant: (key) => (key === 'M31' ? sampleMerchant : null),
    callModel: async () => null,
    getApiKey: () => undefined,
    cache: createAiBriefCache(),
    now: () => 1_700_000_000_000,
    ...overrides,
  };
}

describe('resolveAiBrief', () => {
  it('rejects invalid merchant key', async () => {
    const r = await resolveAiBrief({ merchantKey: '../x', promptId: 'overview' }, deps());
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.body.error).toBe('invalid_merchant');
  });

  it('returns deterministic overview without API key', async () => {
    const r = await resolveAiBrief({ merchantKey: 'M31', promptId: 'overview' }, deps());
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.body.source).toBe('deterministic');
    expect(r.body.demo).toBe(true);
    expect(r.body.actions[0]?.title).toBe(buildMerchantActions(sampleMerchant)[0]?.title);
    expect(r.log.cacheHit).toBe(false);
  });

  it('serves cache on second recipe hit', async () => {
    const cache = createAiBriefCache();
    const d = deps({ cache });
    const first = await resolveAiBrief({ merchantKey: 'M31', promptId: 'overview' }, d);
    const second = await resolveAiBrief({ merchantKey: 'M31', promptId: 'overview' }, d);
    expect(first.ok && second.ok).toBe(true);
    if (first.ok && second.ok) {
      expect(first.body.cached).toBe(false);
      expect(second.body.cached).toBe(true);
      expect(second.log.cacheHit).toBe(true);
      expect(second.body.summary).toBe(first.body.summary);
    }
  });

  it('maps missing merchant to 404', async () => {
    const r = await resolveAiBrief({ merchantKey: 'M9999', promptId: 'overview' }, deps());
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.status).toBe(404);
      expect(r.body.error).toBe('merchant_not_found');
    }
  });
});
