export const IMPACT_FAMILIES = [
  'gateway_broken',
  'no_attempt',
  'in_bank',
  'psp_routing',
  'price_point',
  'residual',
] as const;

export type ImpactFamily = (typeof IMPACT_FAMILIES)[number];

export function assignImpactFamily(input: {
  health: string;
  noAttemptRate: number;
  inBankRate: number;
  uniquePrices: number | null;
}): ImpactFamily {
  if (input.health.startsWith('pattern_')) return 'gateway_broken';
  if (input.noAttemptRate >= 0.4) return 'no_attempt';
  if (input.uniquePrices !== null && input.uniquePrices <= 4) return 'price_point';
  if (input.inBankRate >= 0.25) return 'in_bank';
  return 'residual';
}

export function impactUnionOk(
  cases: readonly { impactRial: number }[],
  recoverableTotal: number,
): boolean {
  const sum = cases.reduce((acc, row) => acc + row.impactRial, 0);
  return sum === recoverableTotal;
}
