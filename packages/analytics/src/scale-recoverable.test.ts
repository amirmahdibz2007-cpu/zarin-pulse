import { describe, expect, it } from 'vitest';
import { scaleRecoverable } from './scale-recoverable';

describe('scaleRecoverable', () => {
  it('scales linearly and clamps', () => {
    const impact = { conservative: 100, expected: 200, optimistic: 300 };
    expect(scaleRecoverable(impact, 0)).toEqual({
      conservative: 0,
      expected: 0,
      optimistic: 0,
    });
    expect(scaleRecoverable(impact, 50)).toEqual({
      conservative: 50,
      expected: 100,
      optimistic: 150,
    });
    expect(scaleRecoverable(impact, 100).expected).toBe(200);
    expect(scaleRecoverable(impact, 150).expected).toBe(200);
    expect(scaleRecoverable(impact, -5).expected).toBe(0);
  });
});
