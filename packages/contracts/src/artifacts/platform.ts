import { z } from 'zod';

const finiteNumber = z.number().finite();

const terminalBucketSchema = z.object({
  n: finiteNumber,
  amount: finiteNumber,
});

const hazardRowSchema = z.object({
  k: finiteNumber,
  at_risk: finiteNumber,
  won: finiteNumber,
  h: finiteNumber,
  ci: z.tuple([finiteNumber, finiteNumber]).nullable(),
});

const dailyRowSchema = z.object({
  day: z.string().min(1),
  sessions: finiteNumber,
  low: z.boolean(),
});

const jalaliMonthSchema = z.object({
  key: z.string().min(1),
  days: finiteNumber,
  revenue_rial: finiteNumber,
  orders: finiteNumber,
  per_day_revenue: finiteNumber,
  per_day_orders: finiteNumber,
  aov: finiteNumber,
});

const weekdayRowSchema = z.object({
  weekday: finiteNumber,
  sessions: finiteNumber,
  revenue_rial: finiteNumber,
  orders: finiteNumber,
  aov: finiteNumber,
});

/**
 * Wire format for platform.json. Extra ETL fields are allowed via passthrough.
 */
export const platformArtifactSchema = z
  .object({
    sourceSha256: z.string().min(1),
    sessions_total: finiteNumber,
    merchants_total: finiteNumber,
    verified_try_session_gap: finiteNumber,
    terminal: z.record(z.string(), terminalBucketSchema),
    revenue_rial: finiteNumber,
    orders: finiteNumber,
    aov: finiteNumber,
    paid_pending_rial: finiteNumber,
    fee_realized_rial: finiteNumber,
    recoverable_expected_rial: finiteNumber,
    low_coverage_days: finiteNumber,
    optimal_retry_cap: finiteNumber,
    hazard: z.array(hazardRowSchema),
    daily: z.array(dailyRowSchema),
    jalali_months: z.array(jalaliMonthSchema),
    weekdays: z.array(weekdayRowSchema).optional(),
  });

export type PlatformArtifactParsed = z.infer<typeof platformArtifactSchema>;

export function parsePlatformArtifact(data: unknown): PlatformArtifactParsed {
  return platformArtifactSchema.parse(data);
}

export function safeParsePlatformArtifact(data: unknown) {
  return platformArtifactSchema.safeParse(data);
}

export const manifestArtifactSchema = z.object({
  builtAt: z.string().min(1),
  sourceSha256: z.string().min(1),
  files: z.record(z.string(), z.string()),
});

export type ManifestArtifactParsed = z.infer<typeof manifestArtifactSchema>;

export function parseManifestArtifact(data: unknown): ManifestArtifactParsed {
  return manifestArtifactSchema.parse(data);
}
