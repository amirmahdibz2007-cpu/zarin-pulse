export function logAmountBand(amount: number): number {
  if (!(amount > 0)) {
    throw new RangeError(`logAmountBand requires amount > 0: ${amount}`);
  }
  return Math.floor(Math.log10(amount) * 4) / 4;
}

export function expectedFeeRate(
  weights: readonly { band: number; weight: number }[],
  ref: ReadonlyMap<number, number>,
): number {
  let sum = 0;
  let w = 0;
  for (const row of weights) {
    const rate = ref.get(row.band);
    if (rate === undefined) continue;
    sum += row.weight * rate;
    w += row.weight;
  }
  if (w === 0) return 0;
  return sum / w;
}

export function tariffEffect(actualRate: number, expectedRate: number): number {
  return actualRate - expectedRate;
}

/**
 * Adjacent log-bands must not invert as violently as amount-deciles did
 * in the first failed attempt (p50 jump from ~1.08% down to ~0.26%).
 */
export function maxAdjacentRatio(sortedRates: readonly number[]): number {
  if (sortedRates.length < 2) return 1;
  let max = 1;
  for (let i = 1; i < sortedRates.length; i += 1) {
    const a = sortedRates[i - 1] ?? 0;
    const b = sortedRates[i] ?? 0;
    if (a <= 0 || b <= 0) continue;
    max = Math.max(max, a / b, b / a);
  }
  return max;
}
