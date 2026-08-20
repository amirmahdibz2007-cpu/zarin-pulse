import { describe, expect, it } from 'vitest';
import { GOLDEN } from './golden';

describe('golden identities', () => {
  it('try_status sums to rows_total', () => {
    const sum = Object.values(GOLDEN.try_status).reduce((a, n) => a + n, 0);
    expect(sum).toBe(GOLDEN.rows_total);
  });

  it('no_attempt + attempted = sessions', () => {
    expect(GOLDEN.no_attempt + GOLDEN.attempted).toBe(GOLDEN.sessions_total);
  });

  it('session vs try verified gap is 28', () => {
    expect(GOLDEN.session_verified - GOLDEN.sessions_with_try_verified).toBe(
      GOLDEN.verified_try_session_gap,
    );
  });

  it('terminal states sum to sessions', () => {
    const sum = Object.values(GOLDEN.terminal).reduce((a, n) => a + n, 0);
    expect(sum).toBe(GOLDEN.sessions_total);
  });

  it('attempted identity holds', () => {
    expect(
      GOLDEN.session_verified +
        GOLDEN.paid_sessions +
        GOLDEN.reversed_sessions +
        GOLDEN.failed_after_attempt,
    ).toBe(GOLDEN.attempted);
  });
});
