import { describe, expect, it } from 'vitest';
import {
  formatJalali,
  jalaliWeekdayIso,
  jalaliWeekdayName,
  isoToJalali,
} from './jalali';

describe('isoToJalali golden table', () => {
  it('2026-01-10 → ۲۰ دی ۱۴۰۴', () => {
    expect(isoToJalali('2026-01-10')).toEqual({ year: 1404, month: 10, day: 20 });
    expect(formatJalali('2026-01-10')).toBe('۲۰ دی ۱۴۰۴');
  });

  it('2026-02-20 → ۱ اسفند ۱۴۰۴', () => {
    expect(isoToJalali('2026-02-20')).toEqual({ year: 1404, month: 12, day: 1 });
    expect(formatJalali('2026-02-20')).toBe('۱ اسفند ۱۴۰۴');
  });

  it('2026-02-23 → ۴ اسفند ۱۴۰۴', () => {
    expect(isoToJalali('2026-02-23')).toEqual({ year: 1404, month: 12, day: 4 });
    expect(formatJalali('2026-02-23')).toBe('۴ اسفند ۱۴۰۴');
  });

  it('2026-03-21 → ۱ فروردین ۱۴۰۵', () => {
    expect(isoToJalali('2026-03-21')).toEqual({ year: 1405, month: 1, day: 1 });
    expect(formatJalali('2026-03-21')).toBe('۱ فروردین ۱۴۰۵');
  });

  it('2026-04-21 → ۱ اردیبهشت ۱۴۰۵', () => {
    expect(isoToJalali('2026-04-21')).toEqual({ year: 1405, month: 2, day: 1 });
    expect(formatJalali('2026-04-21')).toBe('۱ اردیبهشت ۱۴۰۵');
  });

  it('2026-05-22 → ۱ خرداد ۱۴۰۵', () => {
    expect(isoToJalali('2026-05-22')).toEqual({ year: 1405, month: 3, day: 1 });
    expect(formatJalali('2026-05-22')).toBe('۱ خرداد ۱۴۰۵');
  });

  it('2026-06-22 → ۱ تیر ۱۴۰۵', () => {
    expect(isoToJalali('2026-06-22')).toEqual({ year: 1405, month: 4, day: 1 });
    expect(formatJalali('2026-06-22')).toBe('۱ تیر ۱۴۰۵');
  });
});

describe('jalali weekday', () => {
  it('maps Saturday 2026-01-10 to شنبه = 0', () => {
    expect(jalaliWeekdayIso('2026-01-10')).toBe(0);
    expect(jalaliWeekdayName('2026-01-10')).toBe('شنبه');
  });

  it('maps Sunday 2026-01-11 to یکشنبه = 1', () => {
    expect(jalaliWeekdayIso('2026-01-11')).toBe(1);
    expect(jalaliWeekdayName('2026-01-11')).toBe('یکشنبه');
  });
});
