export type AmountBandId = 'lt_0_5m' | '0_5_2m' | '2_5m' | '5_10m' | '10m_plus';

export type AmountBandRow = {
  id: AmountBandId;
  sessions: number;
  verified: number;
  success_rate: number;
  revenue_rial: number;
};

const BAND_ORDER: AmountBandId[] = ['lt_0_5m', '0_5_2m', '2_5m', '5_10m', '10m_plus'];

export function amountBandId(amountRial: number): AmountBandId {
  if (!(amountRial > 0)) return 'lt_0_5m';
  if (amountRial < 500_000) return 'lt_0_5m';
  if (amountRial < 2_000_000) return '0_5_2m';
  if (amountRial < 5_000_000) return '2_5m';
  if (amountRial < 10_000_000) return '5_10m';
  return '10m_plus';
}

export function summarizeAmountBands(
  rows: ReadonlyArray<{ amountRial: number; verified: boolean }>,
): AmountBandRow[] {
  const acc: Record<AmountBandId, { sessions: number; verified: number; revenue: number }> = {
    lt_0_5m: { sessions: 0, verified: 0, revenue: 0 },
    '0_5_2m': { sessions: 0, verified: 0, revenue: 0 },
    '2_5m': { sessions: 0, verified: 0, revenue: 0 },
    '5_10m': { sessions: 0, verified: 0, revenue: 0 },
    '10m_plus': { sessions: 0, verified: 0, revenue: 0 },
  };
  for (const row of rows) {
    const id = amountBandId(row.amountRial);
    const bucket = acc[id]!;
    bucket.sessions += 1;
    if (row.verified) {
      bucket.verified += 1;
      bucket.revenue += row.amountRial;
    }
  }
  return BAND_ORDER.map((id) => {
    const b = acc[id]!;
    return {
      id,
      sessions: b.sessions,
      verified: b.verified,
      success_rate: b.sessions === 0 ? 0 : b.verified / b.sessions,
      revenue_rial: b.revenue,
    };
  });
}
