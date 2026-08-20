'use client';

import { useMemo, useState } from 'react';
import { copy, formatRatioAsPercent } from '@zarinpulse/contracts';

const FLOOR = 1_920;

export function FeeCalculator(props: { defaultBasket: number }) {
  const [basket, setBasket] = useState(String(props.defaultBasket));
  const rate = useMemo(() => {
    const n = Number(basket);
    if (!Number.isFinite(n) || n <= 0) return null;
    return Math.max(FLOOR, 0.004 * n) / n;
  }, [basket]);
  return (
    <section>
      <p className="font-medium">{copy.feeCalc.title}</p>
      <label className="mt-3 block text-sm">
        {copy.feeCalc.basket}
        <input
          className="control-neuro mt-2 min-h-11 w-full px-3"
          inputMode="numeric"
          value={basket}
          onChange={(e) => setBasket(e.target.value)}
        />
      </label>
      <p className="kpi-value mt-3 text-2xl">{rate === null ? '—' : formatRatioAsPercent(rate)}</p>
      <p className="kpi-plain">{copy.feeCalc.result}</p>
    </section>
  );
}
