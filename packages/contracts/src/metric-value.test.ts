import { describe, expect, it } from 'vitest';
import { count, rial } from './brands';
import type { FeeAmount } from './metric-value';
import { exhaustive, formatMetricKind, isOk } from './metric-value';
import type { MetricValue } from './metric-value';

describe('MetricValue', () => {
  it('isOk narrows to the value field', () => {
    const sample: MetricValue<number> = {
      kind: 'insufficient',
      reason: 'below_min_sample',
      n: count(3),
      required: count(100),
    };
    expect(isOk(sample)).toBe(false);
    expect(formatMetricKind(sample)).toBe('insufficient');
  });

  it('exhaustive throws on a forged never', () => {
    expect(() => exhaustive('nope' as never)).toThrow(/non-exhaustive/);
  });

  it('FeeAmount requires an explicit realization', () => {
    const fee: FeeAmount = { realization: 'realized', rial: rial(1_920) };
    expect(fee.realization).toBe('realized');
    const potential: FeeAmount = { realization: 'potential', rial: rial(0) };
    expect(potential.realization).toBe('potential');
  });
});
