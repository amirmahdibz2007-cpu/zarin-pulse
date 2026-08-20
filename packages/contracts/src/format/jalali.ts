const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'] as const;

const MONTHS_FA = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
] as const;

const WEEKDAYS_FA = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنجشنبه',
  'جمعه',
] as const;

const WEEKDAYS_FA_SHORT = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'] as const;

export interface JalaliDate {
  year: number;
  month: number;
  day: number;
}

/**
 * Convert a Gregorian civil date to Jalali.
 * Algorithm: calendar conversion used by jalaali-js (public domain).
 */
export function gregorianToJalali(gy: number, gm: number, gd: number): JalaliDate {
  if (!Number.isInteger(gy) || !Number.isInteger(gm) || !Number.isInteger(gd)) {
    throw new RangeError(`Gregorian date must be integers: ${gy}-${gm}-${gd}`);
  }
  if (gm < 1 || gm > 12 || gd < 1 || gd > 31) {
    throw new RangeError(`Gregorian date out of range: ${gy}-${gm}-${gd}`);
  }

  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    355666 +
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) +
    gd +
    (g_d_m[gm - 1] ?? 0);
  let jy = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return { year: jy, month: jm, day: jd };
}

export function parseIsoDate(iso: string): { year: number; month: number; day: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) {
    throw new RangeError(`ISO date must be YYYY-MM-DD: ${iso}`);
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return { year, month, day };
}

export function isoToJalali(iso: string): JalaliDate {
  const g = parseIsoDate(iso);
  return gregorianToJalali(g.year, g.month, g.day);
}

export function toFaDigits(input: string): string {
  return input.replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)] ?? d);
}

/**
 * JavaScript Date#getUTCDay: 0=Sunday … 6=Saturday.
 * Jalali week in this product: 0=شنبه … 6=جمعه.
 *
 * Spec originally wrote (gregorianWeekday+2)%7. That maps Saturday to 1.
 * 2026-01-10 is Saturday and must be شنبه=0, so the live formula is +1.
 * See docs/CHANGELOG-spec.md.
 */
export function jalaliWeekdayFromUtcDay(gregorianUtcDay: number): number {
  if (!Number.isInteger(gregorianUtcDay) || gregorianUtcDay < 0 || gregorianUtcDay > 6) {
    throw new RangeError(`UTC weekday must be 0..6: ${gregorianUtcDay}`);
  }
  return (gregorianUtcDay + 1) % 7;
}

export function jalaliWeekdayIso(iso: string): number {
  const { year, month, day } = parseIsoDate(iso);
  const utcDay = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return jalaliWeekdayFromUtcDay(utcDay);
}

export function formatJalali(iso: string): string {
  const j = isoToJalali(iso);
  const monthName = MONTHS_FA[j.month - 1];
  if (monthName === undefined) {
    throw new RangeError(`Jalali month out of range: ${j.month}`);
  }
  return `${toFaDigits(String(j.day))} ${monthName} ${toFaDigits(String(j.year))}`;
}

export function jalaliWeekdayName(iso: string): string {
  const idx = jalaliWeekdayIso(iso);
  const name = WEEKDAYS_FA[idx];
  if (name === undefined) {
    throw new RangeError(`Jalali weekday out of range: ${idx}`);
  }
  return name;
}

export { MONTHS_FA, WEEKDAYS_FA, WEEKDAYS_FA_SHORT };
