export const GOLDEN = {
  rows_total: 2_213_289,
  sessions_total: 2_062_839,
  merchants_total: 343,
  categories_total: 5,
  distinct_psp: 8,
  try_status: {
    Verified: 1_025_627,
    InBank: 883_618,
    NoAttempt: 263_936,
    Failed: 31_374,
    Paid: 8_733,
    Reversed: 1,
  },
  session_verified: 1_025_655,
  sessions_with_try_verified: 1_025_627,
  verified_try_session_gap: 28,
  no_attempt: 263_936,
  attempted: 1_798_903,
  paid_sessions: 8_706,
  reversed_sessions: 1,
  failed_after_attempt: 764_541,
  revenue_total_rial: 5_165_464_690_799,
  orders_total: 1_025_655,
  paid_pending_amount_rial: 116_550_558_678,
  amount_conflicts: 0,
  low_coverage_days: 19,
  hazard: {
    h1_at_risk: 1_798_903,
    h1_won: 985_973,
    h2_at_risk: 72_432,
    h2_won: 30_224,
    last_success_k: 24,
  },
  fee_realized_rial: 20_957_181_891,
  fee_min: 1_920,
  fee_mode: 1_952,
  gateway: {
    zero_verified_ge_100: 12,
    degraded_or_worse_below_10pct: 22,
  },
  concentration: {
    m250_sessions: 1_055_912,
    top5_share: 0.811,
  },
  terminal: {
    Verified: 1_025_627,
    InBank: 733_620,
    NoAttempt: 263_936,
    Failed: 30_939,
    Paid: 8_716,
    Reversed: 1,
  },
} as const;

export function assertEqual(name: string, actual: number, expected: number): void {
  if (actual !== expected) {
    throw new Error(`golden ${name}: expected ${expected}, got ${actual}`);
  }
}

export function assertClose(name: string, actual: number, expected: number, eps: number): void {
  if (!Number.isFinite(actual) || Math.abs(actual - expected) > eps) {
    throw new Error(`golden ${name}: expected ${expected} ± ${eps}, got ${actual}`);
  }
}
