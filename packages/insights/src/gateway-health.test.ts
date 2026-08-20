import { describe, expect, it } from 'vitest';
import { backtestLabel, classifyGateway } from './gateway-health';

describe('classifyGateway', () => {
  it('labels M91 as pattern 1', () => {
    expect(
      classifyGateway({ sessions: 3_393, verified: 0, noAttempt: 3_393, paidPending: 0 }),
    ).toBe('pattern_1_no_bank_reach');
  });

  it('labels M282 as pattern 2', () => {
    expect(
      classifyGateway({ sessions: 2_307, verified: 0, noAttempt: 111, paidPending: 1_475 }),
    ).toBe('pattern_2_verify_broken');
  });

  it('labels M167 as pattern 3', () => {
    expect(
      classifyGateway({ sessions: 339, verified: 0, noAttempt: 8, paidPending: 0 }),
    ).toBe('pattern_3_terminal_config');
  });
});

describe('backtestLabel', () => {
  it('is strong at 70% hit rate with n>=10', () => {
    expect(backtestLabel(0.8, 12)).toBe('strong');
    expect(backtestLabel(0.55, 12)).toBe('weak');
    expect(backtestLabel(0.4, 12)).toBe('unproven');
  });
});
