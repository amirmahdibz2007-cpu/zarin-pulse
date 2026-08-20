import { describe, expect, it } from 'vitest';
import { count, rial } from './brands';

describe('rial', () => {
  it('accepts non-negative integers including zero', () => {
    expect(rial(0)).toBe(0);
    expect(rial(1_920)).toBe(1_920);
  });

  it('rejects negatives', () => {
    expect(() => rial(-1)).toThrow(RangeError);
  });

  it('rejects non-integers', () => {
    expect(() => rial(1.5)).toThrow(RangeError);
    expect(() => rial(Number.NaN)).toThrow(RangeError);
  });
});

describe('count', () => {
  it('accepts zero', () => {
    expect(count(0)).toBe(0);
  });

  it('rejects a fractional sample size', () => {
    expect(() => count(2.1)).toThrow(RangeError);
  });
});
