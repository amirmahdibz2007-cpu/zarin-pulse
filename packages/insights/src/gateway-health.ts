export type GatewayHealth =
  | 'pattern_1_no_bank_reach'
  | 'pattern_2_verify_broken'
  | 'pattern_3_terminal_config'
  | 'degraded'
  | 'healthy';

export function classifyGateway(input: {
  sessions: number;
  verified: number;
  noAttempt: number;
  paidPending: number;
}): GatewayHealth {
  const { sessions, verified, noAttempt, paidPending } = input;
  if (sessions < 100) return 'healthy';
  const noAttemptRate = noAttempt / sessions;
  if (verified === 0 && noAttemptRate >= 0.95) return 'pattern_1_no_bank_reach';
  if (verified === 0 && paidPending > 0) return 'pattern_2_verify_broken';
  if (verified === 0) return 'pattern_3_terminal_config';
  if (verified / sessions < 0.1) return 'degraded';
  return 'healthy';
}

export function backtestLabel(hitRate: number, n: number): 'strong' | 'weak' | 'unproven' {
  if (n >= 10 && hitRate >= 0.7) return 'strong';
  if (hitRate >= 0.5) return 'weak';
  return 'unproven';
}
