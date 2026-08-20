import { attributionShare, isAnomaly, madSigma } from '@zarinpulse/analytics';

export function dailyAnomaly(values: readonly number[], value: number): {
  median: number;
  sigma: number;
  anomaly: boolean;
} {
  const baseline = values.filter((v) => Number.isFinite(v));
  if (baseline.length === 0) {
    throw new RangeError('dailyAnomaly requires a baseline');
  }
  const sorted = [...baseline].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)] ?? 0;
  const sigma = madSigma(baseline);
  return { median, sigma, anomaly: isAnomaly(value, median, sigma) };
}

export function attributeSpike(
  parts: readonly { key: string; excess: number }[],
): { key: string; share: number }[] {
  const shares = attributionShare(parts.map((p) => p.excess));
  return parts.map((p, i) => ({ key: p.key, share: shares.shares[i] ?? 0 }));
}

export { attributionShare };
