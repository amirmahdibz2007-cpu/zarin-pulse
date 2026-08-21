import { describe, expect, it } from 'vitest';
import { copy } from '@zarinpulse/contracts';
import { buildMerchantActions, isSparseMerchant, type MerchantActionInput } from './merchant-actions';

function base(partial: Partial<MerchantActionInput> & Pick<MerchantActionInput, 'key'>): MerchantActionInput {
  return {
    sessions: 1000,
    verified: 500,
    no_attempt: 100,
    in_bank: 100,
    failed: 10,
    paid_pending: 0,
    paid_amount_rial: 0,
    success_rate: 0.5,
    health: 'healthy',
    unique_prices: 10,
    fee_actual: null,
    tariff_effect: null,
    peers: null,
    impact: null,
    ...partial,
  };
}

describe('isSparseMerchant', () => {
  it('treats sessions under 100 as sparse when tier is missing', () => {
    expect(isSparseMerchant({ sessions: 97 })).toBe(true);
    expect(isSparseMerchant({ sessions: 100 })).toBe(false);
    expect(isSparseMerchant({ sessions: 500, tier: 'sparse' })).toBe(true);
  });
});

describe('buildMerchantActions', () => {
  it('ranks M282 as pending then health', () => {
    const actions = buildMerchantActions(
      base({
        key: 'M282',
        sessions: 2307,
        verified: 0,
        no_attempt: 110,
        in_bank: 664,
        failed: 59,
        paid_pending: 1475,
        paid_amount_rial: 443_400_000,
        success_rate: 0,
        health: 'pattern_2_verify_broken',
        unique_prices: 0,
        impact: { expected: 157_537_924 },
      }),
    );
    expect(actions.map((a) => a.kind)).toEqual(['pending', 'health']);
    expect(actions[0]?.body).toContain('ریال');
    expect(actions[1]?.body).toMatch(/قابل بازیابی|تطبیق/);
  });

  it('ranks M91 as health only without fee', () => {
    const actions = buildMerchantActions(
      base({
        key: 'M91',
        sessions: 3393,
        verified: 0,
        no_attempt: 3393,
        in_bank: 0,
        failed: 0,
        success_rate: 0,
        health: 'pattern_1_no_bank_reach',
        unique_prices: 0,
        impact: { expected: 13_708_325_893 },
      }),
    );
    expect(actions.map((a) => a.kind)).toEqual(['health']);
    expect(actions.some((a) => a.kind === 'fee')).toBe(false);
    expect(actions[0]?.body).toContain('قابل بازیابی');
  });

  it('ranks M31 as in_bank funnel then peer without fee', () => {
    const actions = buildMerchantActions(
      base({
        key: 'M31',
        sessions: 312_814,
        verified: 61_255,
        no_attempt: 24_242,
        in_bank: 224_589,
        failed: 2728,
        success_rate: 0.195819240827,
        health: 'healthy',
        unique_prices: 23,
        fee_actual: 0.002927648982,
        tariff_effect: -0.00179121903,
        peers: { n: 20, p75: 0.482336232913, gap: 0.286516992086 },
        impact: { expected: 83_751_727_401 },
      }),
    );
    expect(actions.map((a) => a.kind)).toEqual(['funnel', 'peer']);
    expect(actions[0]?.title).toBe(copy.actionBrief.inBankTitle);
    expect(actions[0]?.body).toMatch(/%|٪/);
    expect(actions[0]?.body).toContain('قابل بازیابی');
    expect(actions[0]?.nextStep.length).toBeGreaterThan(0);
    expect(actions[0]?.why.length).toBeGreaterThan(0);
    expect(actions.some((a) => a.kind === 'fee')).toBe(false);
  });

  it('ranks M106 as fee when unique_prices is 1', () => {
    const actions = buildMerchantActions(
      base({
        key: 'M106',
        sessions: 3470,
        verified: 2453,
        no_attempt: 709,
        in_bank: 278,
        failed: 31,
        success_rate: 0.706916426513,
        health: 'healthy',
        unique_prices: 1,
        fee_actual: 0.081135862913,
        tariff_effect: 0.021730038584,
        peers: { n: 9, p75: 0.581333333333, gap: -0.12558309318 },
        impact: null,
      }),
    );
    expect(actions.map((a) => a.kind)).toEqual(['fee']);
  });

  it('ranks M156 as pending then in_bank', () => {
    const actions = buildMerchantActions(
      base({
        key: 'M156',
        sessions: 55_940,
        verified: 10_000,
        no_attempt: 5_000,
        in_bank: 30_000,
        failed: 500,
        paid_amount_rial: 61_847_264_950,
        success_rate: 0.2,
        health: 'healthy',
        unique_prices: 26_147,
        tariff_effect: 0.000452303035,
        impact: { expected: 1 },
      }),
    );
    expect(actions.map((a) => a.kind)).toEqual(['pending', 'funnel']);
  });

  it('returns sparse alone for M315-scale merchants', () => {
    const actions = buildMerchantActions(
      base({
        key: 'M315',
        sessions: 97,
        paid_amount_rial: 3_500_000,
        health: 'healthy',
        unique_prices: 9,
        tariff_effect: 0.005589149141,
      }),
    );
    expect(actions.map((a) => a.kind)).toEqual(['sparse']);
  });

  it('does not treat positive tariff_effect alone as a fee trap', () => {
    const actions = buildMerchantActions(
      base({
        key: 'M1',
        sessions: 5000,
        verified: 4000,
        no_attempt: 200,
        in_bank: 500,
        failed: 50,
        health: 'healthy',
        unique_prices: 2,
        fee_actual: 0.08,
        tariff_effect: 0.05,
        peers: { n: 5, p75: 0.5, gap: -0.1 },
      }),
    );
    expect(actions.some((a) => a.kind === 'fee')).toBe(false);
  });
});
