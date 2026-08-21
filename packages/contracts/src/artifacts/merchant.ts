import { z } from 'zod';

const finiteNumber = z.number().finite();

export const gatewayHealthSchema = z.enum([
  'pattern_1_no_bank_reach',
  'pattern_2_verify_broken',
  'pattern_3_terminal_config',
  'degraded',
  'healthy',
]);

export const merchantTierSchema = z.enum(['rich', 'limited', 'sparse']);

const peersSchema = z
  .object({
    n: finiteNumber,
    p75: finiteNumber,
    gap: finiteNumber,
  })
  .nullable();

const impactSchema = z
  .object({
    currency: z.string(),
    expected: finiteNumber,
    conservative: finiteNumber,
    optimistic: finiteNumber,
    basis: z.string(),
  })
  .nullable();

const pendingSchema = z.object({
  currency: z.string(),
  rial: finiteNumber,
});

const dailyPointSchema = z.object({
  day: z.string().min(1),
  sessions: finiteNumber,
  revenue_rial: finiteNumber,
  orders: finiteNumber,
});

const jalaliMonthSchema = z.object({
  key: z.string().min(1),
  days: finiteNumber,
  revenue_rial: finiteNumber,
  orders: finiteNumber,
  sessions: finiteNumber,
  per_day_revenue: finiteNumber,
  aov: finiteNumber,
});

const weekdaySchema = z.object({
  weekday: finiteNumber,
  sessions: finiteNumber,
  revenue_rial: finiteNumber,
  orders: finiteNumber,
  aov: finiteNumber,
});

const seriesSchema = z.object({
  daily: z.array(dailyPointSchema),
  jalali_months: z.array(jalaliMonthSchema),
  weekdays: z.array(weekdaySchema),
});

const tierBucketSchema = z.object({
  customers: finiteNumber,
  revenue_rial: finiteNumber,
  share_of_revenue: finiteNumber,
});

const amountBandSchema = z.object({
  id: z.enum(['lt_0_5m', '0_5_2m', '2_5m', '5_10m', '10m_plus']),
  sessions: finiteNumber,
  verified: finiteNumber,
  success_rate: finiteNumber,
  revenue_rial: finiteNumber,
});

const pspMixSchema = z.object({
  psp: z.string().min(1),
  sessions: finiteNumber,
  verified: finiteNumber,
  success_rate: finiteNumber,
});

const opsSchema = z
  .object({
    customer_tiers: z.object({
      gold: tierBucketSchema,
      silver: tierBucketSchema,
      bronze: tierBucketSchema,
      at_risk: tierBucketSchema,
    }),
    amount_bands: z.array(amountBandSchema),
    sales_peaks: z.object({
      top_days: z.array(
        z.object({
          day: z.string().min(1),
          orders: finiteNumber,
          revenue_rial: finiteNumber,
          sessions: finiteNumber,
        }),
      ),
    }),
    psp_mix: z.array(pspMixSchema).optional(),
  })
  .nullable()
  .optional();

/**
 * Wire format for merchants/{key}.json — mirrors ETL output.
 * Note: `tier` / `recoverable_rial` live on merchants-index.json, not full merchant files.
 * .passthrough() keeps forward-compatible fields without silent drops.
 */
export const merchantArtifactSchema = z
  .object({
    key: z.string().min(1),
    category: z.string(),
    sessions: finiteNumber,
    verified: finiteNumber,
    success_rate: finiteNumber,
    revenue_rial: finiteNumber,
    health: z.string(),
    /** Present on index rows; optional on full merchant dossiers. */
    tier: merchantTierSchema.optional(),
    recoverable_rial: finiteNumber.optional(),
    no_attempt: finiteNumber,
    in_bank: finiteNumber,
    failed: finiteNumber,
    paid_pending: finiteNumber,
    paid_amount_rial: finiteNumber,
    attempted_amount_rial: finiteNumber.optional(),
    median_amount: finiteNumber,
    aov: finiteNumber.nullable(),
    fee_actual: finiteNumber.nullable(),
    fee_expected: finiteNumber.nullable(),
    tariff_effect: finiteNumber.nullable(),
    fee_realized: finiteNumber,
    fee_potential: finiteNumber,
    peers: peersSchema,
    impact: impactSchema,
    pending: pendingSchema,
    unique_prices: finiteNumber.optional(),
    customers: finiteNumber.optional(),
    repeat_customers: finiteNumber.optional(),
    repeat_order_share: finiteNumber.nullable().optional(),
    business_model: z.string().nullable().optional(),
    case_family: z.string().nullable().optional(),
    series: seriesSchema.optional(),
    ops: opsSchema,
  });

/** Parsed merchant dossier — unknown ETL keys stripped at the boundary. */
export type MerchantArtifactParsed = z.infer<typeof merchantArtifactSchema>;

export function parseMerchantArtifact(data: unknown): MerchantArtifactParsed {
  return merchantArtifactSchema.parse(data);
}

export function safeParseMerchantArtifact(data: unknown) {
  return merchantArtifactSchema.safeParse(data);
}
