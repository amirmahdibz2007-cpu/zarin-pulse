import { customerAtRisk } from './cohort';

export type CardValue = {
  cardKey: string;
  orders: number;
  revenueRial: number;
  lastOrderIso: string;
  firstOrderIso: string;
};

export type TierId = 'gold' | 'silver' | 'bronze' | 'at_risk';

export type TierBucketSummary = {
  customers: number;
  revenue_rial: number;
  share_of_revenue: number;
};

export type CustomerTiersResult = {
  gold: CardValue[];
  silver: CardValue[];
  bronze: CardValue[];
  at_risk: CardValue[];
  summary: {
    gold: TierBucketSummary;
    silver: TierBucketSummary;
    bronze: TierBucketSummary;
    at_risk: TierBucketSummary;
  };
};

function summarize(cards: CardValue[], totalRevenue: number): TierBucketSummary {
  const revenue = cards.reduce((s, c) => s + c.revenueRial, 0);
  return {
    customers: cards.length,
    revenue_rial: revenue,
    share_of_revenue: totalRevenue > 0 ? revenue / totalRevenue : 0,
  };
}

/** Days between first and last order / (orders-1), else 30. */
export function inferIntervalDays(card: CardValue): number {
  if (card.orders < 2) return 30;
  const first = Date.parse(`${card.firstOrderIso}T00:00:00Z`);
  const last = Date.parse(`${card.lastOrderIso}T00:00:00Z`);
  if (!Number.isFinite(first) || !Number.isFinite(last) || last < first) return 30;
  const spanDays = (last - first) / 86_400_000;
  const gap = spanDays / Math.max(1, card.orders - 1);
  if (!(gap > 0) || !Number.isFinite(gap)) return 30;
  return Math.max(7, Math.min(90, Math.round(gap)));
}

/**
 * Gold = cards that form the top ~10% of verified revenue (cumulative from richest).
 * Silver = remaining multi-order cards. Bronze = single-order. At-risk overlaps silver/gold.
 */
export function assignCustomerTiers(
  cards: CardValue[],
  dataEndIso: string,
): CustomerTiersResult {
  const eligible = cards.filter((c) => c.orders > 0 && c.revenueRial > 0);
  const totalRevenue = eligible.reduce((s, c) => s + c.revenueRial, 0);
  const sorted = [...eligible].sort(
    (a, b) => b.revenueRial - a.revenueRial || a.cardKey.localeCompare(b.cardKey),
  );

  const gold: CardValue[] = [];
  let cum = 0;
  const goldTarget = totalRevenue * 0.1;
  for (const card of sorted) {
    if (gold.length === 0 || cum < goldTarget) {
      gold.push(card);
      cum += card.revenueRial;
    } else {
      break;
    }
  }
  const goldKeys = new Set(gold.map((c) => c.cardKey));

  const silver: CardValue[] = [];
  const bronze: CardValue[] = [];
  for (const card of sorted) {
    if (goldKeys.has(card.cardKey)) continue;
    if (card.orders >= 2) silver.push(card);
    else bronze.push(card);
  }

  const at_risk: CardValue[] = [];
  for (const card of sorted) {
    if (card.orders < 2) continue;
    if (
      customerAtRisk({
        lastOrderIso: card.lastOrderIso,
        intervalDays: inferIntervalDays(card),
        dataEndIso,
      })
    ) {
      at_risk.push(card);
    }
  }

  return {
    gold,
    silver,
    bronze,
    at_risk,
    summary: {
      gold: summarize(gold, totalRevenue),
      silver: summarize(silver, totalRevenue),
      bronze: summarize(bronze, totalRevenue),
      at_risk: summarize(at_risk, totalRevenue),
    },
  };
}
