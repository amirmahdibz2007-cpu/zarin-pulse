export function madSigma(values: readonly number[]): number {
  if (values.length === 0) throw new RangeError('madSigma requires values');
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted[Math.floor(sorted.length / 2)];
  if (mid === undefined) throw new RangeError('median missing');
  const deviations = values.map((v) => Math.abs(v - mid)).sort((a, b) => a - b);
  const mad = deviations[Math.floor(deviations.length / 2)];
  if (mad === undefined) throw new RangeError('MAD missing');
  return 1.4826 * mad;
}

export function robustZ(value: number, median: number, sigma: number): number {
  if (sigma === 0) return 0;
  return (value - median) / sigma;
}

export function isAnomaly(value: number, median: number, sigma: number): boolean {
  if (sigma === 0) return value !== median;
  return Math.abs(robustZ(value, median, sigma)) >= 3.5;
}

export function attributionShare(excessParts: readonly number[]): {
  shares: number[];
  max: number;
  singleEntity: boolean;
} {
  const excess = excessParts.reduce((a, v) => a + v, 0);
  if (excess <= 0) return { shares: excessParts.map(() => 0), max: 0, singleEntity: false };
  const shares = excessParts.map((v) => v / excess);
  const max = Math.max(...shares);
  return { shares, max, singleEntity: max >= 0.5 };
}
