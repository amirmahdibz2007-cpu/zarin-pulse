import { describe, expect, it } from 'vitest';
import { dailyAnomaly } from './anomaly';
import { matchOccasions, occasionLabel, type Occasion } from './occasions';

const yalda: Occasion = {
  id: 'yalda_1404',
  titleFa: 'yalda',
  kind: 'national',
  startIso: '2025-12-21',
  endIso: '2025-12-21',
  approximate: false,
  inDataWindow: false,
  noteFa: 'out',
};

const nowruz: Occasion = {
  id: 'nowruz_1405',
  titleFa: 'nowruz',
  kind: 'national',
  startIso: '2026-03-21',
  endIso: '2026-04-02',
  approximate: false,
  inDataWindow: true,
  noteFa: 'in',
};

describe('occasions', () => {
  it('marks yalda out of the data window', () => {
    expect(occasionLabel(yalda)).toBe('out_of_window');
    expect(matchOccasions([yalda, nowruz], '2026-03-25').map((o) => o.id)).toEqual(['nowruz_1405']);
  });
});

describe('M27 2026-06-23 spike', () => {
  it('is a single-entity anomaly against the ISP daily median', () => {
    const baseline = Array.from({ length: 40 }, () => 0.123);
    const r = dailyAnomaly(baseline, 7.39);
    expect(r.anomaly).toBe(true);
  });
});
