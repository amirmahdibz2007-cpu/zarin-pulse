/**
 * Weekday session counts sit in a tight band (~90–100% of the peak).
 * A zero baseline makes every column look the same height.
 * When the range is that tight, inset the floor so differences read.
 * The resulting heights must not be read as “from zero”.
 */
export function insetBarPercents(values: readonly number[]): number[] {
  if (values.length === 0) return [];
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const range = max - min;
  const clustered = range / max < 0.25;
  const floor = clustered ? Math.max(0, min - range) : 0;
  const span = Math.max(1, max - floor);
  return values.map((v) => (100 * (v - floor)) / span);
}

/** Fill vs the series max. No 6% floor — that made 0.4% and 1.5% look equal. */
export function vialFillPercent(value: number, max: number): number {
  if (max <= 0 || value <= 0) return 0;
  return Math.max(1.2, (100 * value) / max);
}
