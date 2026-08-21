/** Demo home is framed as this merchant's dashboard (not platform ops). */
export const HOME_SAMPLE_MERCHANT_KEY = 'M31';

export type MerchantPeriodId = 'week' | 'month' | 'months3' | 'months6' | 'year';

export const MERCHANT_PERIOD_ORDER: readonly MerchantPeriodId[] = [
  'week',
  'month',
  'months3',
  'months6',
  'year',
] as const;

export type MerchantSeries = {
  daily: { day: string; revenue_rial: number; orders: number; sessions?: number }[];
  jalali_months: { key: string; revenue_rial: number; orders: number; days: number }[];
};

export type PeriodSum = {
  id: MerchantPeriodId;
  revenue_rial: number;
  orders: number;
  /** True when the requested window is wider than available data. */
  partial: boolean;
  fromDay?: string;
  toDay?: string;
  monthKeys?: string[];
};

function sumDaily(
  daily: MerchantSeries['daily'],
  fromInclusive: string,
): { revenue_rial: number; orders: number; fromDay?: string; toDay?: string } {
  const rows = daily.filter((d) => d.day >= fromInclusive);
  if (rows.length === 0) {
    return { revenue_rial: 0, orders: 0 };
  }
  const fromDay = rows[0]?.day;
  const toDay = rows[rows.length - 1]?.day;
  return {
    revenue_rial: rows.reduce((a, d) => a + d.revenue_rial, 0),
    orders: rows.reduce((a, d) => a + d.orders, 0),
    ...(fromDay ? { fromDay } : {}),
    ...(toDay ? { toDay } : {}),
  };
}

function addCalendarDays(iso: string, delta: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y!, m! - 1, d!));
  dt.setUTCDate(dt.getUTCDate() + delta);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

/**
 * Sum verified sales for a merchant series over UI periods.
 * Year/6mo/3mo use available jalali months (honest partial when short).
 */
export function sumMerchantPeriod(series: MerchantSeries, id: MerchantPeriodId): PeriodSum {
  const daily = series.daily;
  const months = series.jalali_months;
  if (daily.length === 0 && months.length === 0) {
    return { id, revenue_rial: 0, orders: 0, partial: true };
  }

  if (id === 'week') {
    const last = daily[daily.length - 1]?.day;
    if (!last) return { id, revenue_rial: 0, orders: 0, partial: true };
    const from = addCalendarDays(last, -6);
    const first = daily[0]?.day ?? from;
    const sum = sumDaily(daily, from < first ? first : from);
    const spanDays =
      sum.fromDay && sum.toDay
        ? Math.round(
            (Date.parse(`${sum.toDay}T00:00:00Z`) - Date.parse(`${sum.fromDay}T00:00:00Z`)) /
              86_400_000,
          ) + 1
        : 0;
    return {
      id,
      revenue_rial: sum.revenue_rial,
      orders: sum.orders,
      partial: spanDays < 7,
      ...(sum.fromDay ? { fromDay: sum.fromDay } : {}),
      ...(sum.toDay ? { toDay: sum.toDay } : {}),
    };
  }

  const take =
    id === 'month' ? 1 : id === 'months3' ? 3 : id === 'months6' ? 6 : 12;
  const slice = months.slice(-take);
  const revenue_rial = slice.reduce((a, m) => a + m.revenue_rial, 0);
  const orders = slice.reduce((a, m) => a + m.orders, 0);
  const shortMonth = slice.some((m) => m.days < 28);
  return {
    id,
    revenue_rial,
    orders,
    partial: slice.length < take || shortMonth,
    monthKeys: slice.map((m) => m.key),
  };
}
