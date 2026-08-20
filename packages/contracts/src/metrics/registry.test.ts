import { describe, expect, it } from 'vitest';
import { forbiddenTechnicalInPlain } from '../copy/fa';
import { METRICS, metricById } from './registry';

describe('metric registry', () => {
  it('has unique ids', () => {
    const ids = METRICS.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps plainFa free of technical tokens', () => {
    for (const metric of METRICS) {
      expect(forbiddenTechnicalInPlain(metric.plainFa), metric.id).toEqual([]);
    }
  });

  it('marks adjusted_fee metrics as relative-only', () => {
    const fee = metricById('fee_effective_rate');
    expect(fee?.relativeOnly).toBe(true);
    expect(fee?.plainFa.includes('کارمزد واقعی')).toBe(true);
  });

  it('documents the try_status rule on retry hazard', () => {
    const hazard = metricById('retry_hazard');
    expect(hazard?.technicalFa.includes('try_status=Verified')).toBe(true);
    expect(hazard?.technicalFa.includes('verified_at')).toBe(true);
  });
});
