export type AovBasis = 'own' | 'median_attempted' | 'peer_aov';

export function resolveAovBasis(input: {
  verifiedOrders: number;
  ownAov: number | null;
  medianAttemptedAmount: number | null;
  peerAov: number | null;
}): { aov: number; basis: AovBasis } | { aov: null; basis: null } {
  if (input.verifiedOrders > 0 && input.ownAov !== null && input.ownAov > 0) {
    return { aov: input.ownAov, basis: 'own' };
  }
  if (input.medianAttemptedAmount !== null && input.medianAttemptedAmount > 0) {
    return { aov: input.medianAttemptedAmount, basis: 'median_attempted' };
  }
  if (input.peerAov !== null && input.peerAov > 0) {
    return { aov: input.peerAov, basis: 'peer_aov' };
  }
  return { aov: null, basis: null };
}

export function recoverableSales(input: {
  targetRate: number;
  currentRate: number;
  sessions: number;
  aov: number;
  captureRate: number;
}): number {
  const gap = input.targetRate - input.currentRate;
  if (gap <= 0) return 0;
  return gap * input.sessions * input.aov * input.captureRate;
}
