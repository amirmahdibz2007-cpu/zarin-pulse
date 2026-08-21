import { describe, expect, it } from 'vitest';
import {
  parseMerchantArtifact,
  parsePlatformArtifact,
  safeParseMerchantArtifact,
} from './index';

describe('artifact schemas', () => {
  it('accepts a minimal valid merchant shape', () => {
    const m = parseMerchantArtifact({
      key: 'M31',
      category: 'x',
      sessions: 10,
      verified: 2,
      success_rate: 0.2,
      revenue_rial: 1,
      health: 'healthy',
      no_attempt: 1,
      in_bank: 7,
      failed: 0,
      paid_pending: 0,
      paid_amount_rial: 0,
      median_amount: 1,
      aov: null,
      fee_actual: null,
      fee_expected: null,
      tariff_effect: null,
      fee_realized: 0,
      fee_potential: 0,
      peers: null,
      impact: null,
      pending: { currency: 'IRR', rial: 0 },
    });
    expect(m.key).toBe('M31');
  });

  it('rejects NaN sessions', () => {
    const r = safeParseMerchantArtifact({
      key: 'M31',
      category: 'x',
      sessions: Number.NaN,
      verified: 0,
      success_rate: 0,
      revenue_rial: 0,
      health: 'healthy',
      no_attempt: 0,
      in_bank: 0,
      failed: 0,
      paid_pending: 0,
      paid_amount_rial: 0,
      median_amount: 0,
      aov: null,
      fee_actual: null,
      fee_expected: null,
      tariff_effect: null,
      fee_realized: 0,
      fee_potential: 0,
      peers: null,
      impact: null,
      pending: { currency: 'IRR', rial: 0 },
    });
    expect(r.success).toBe(false);
  });

  it('accepts platform core fields', () => {
    const p = parsePlatformArtifact({
      sourceSha256: 'abc',
      sessions_total: 1,
      merchants_total: 1,
      verified_try_session_gap: 28,
      terminal: { Verified: { n: 1, amount: 1 } },
      revenue_rial: 1,
      orders: 1,
      aov: 1,
      paid_pending_rial: 0,
      fee_realized_rial: 0,
      recoverable_expected_rial: 0,
      low_coverage_days: 0,
      optimal_retry_cap: 1,
      hazard: [],
      daily: [],
      jalali_months: [],
      extra_field_ok: true,
    });
    expect(p.sessions_total).toBe(1);
  });
});
