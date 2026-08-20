/** Wilson score interval for a binomial proportion, 95% by default (z = 1.959963984540054). */
export function wilsonInterval(
  successes: number,
  n: number,
  z = 1.959963984540054,
): readonly [number, number] {
  if (!Number.isInteger(successes) || !Number.isInteger(n) || successes < 0 || n <= 0) {
    throw new RangeError(`wilson requires n>0 and successes in 0..n: ${successes}/${n}`);
  }
  if (successes > n) {
    throw new RangeError(`wilson successes cannot exceed n: ${successes}/${n}`);
  }
  const p = successes / n;
  const z2 = z * z;
  const denom = 1 + z2 / n;
  const centre = p + z2 / (2 * n);
  const margin = z * Math.sqrt((p * (1 - p) + z2 / (4 * n)) / n);
  return [(centre - margin) / denom, (centre + margin) / denom];
}

export function wilsonPoint(successes: number, n: number): number {
  if (n <= 0) throw new RangeError(`wilson point requires n>0: ${n}`);
  return successes / n;
}
