export type ImpactTriple = {
  conservative: number;
  expected: number;
  optimistic: number;
};

/**
 * Linear scale of locked impact figures by “reduce InBank by X%” (0–100).
 * At 0 → zero; at 100 → full impact opportunity already on the merchant artifact.
 */
export function scaleRecoverable(impact: ImpactTriple, reduceInBankPct: number): ImpactTriple {
  const t = Math.min(100, Math.max(0, reduceInBankPct)) / 100;
  return {
    conservative: impact.conservative * t,
    expected: impact.expected * t,
    optimistic: impact.optimistic * t,
  };
}
