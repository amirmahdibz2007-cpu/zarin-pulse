import fs from 'node:fs';
import path from 'node:path';

function artifactRoot(): string {
  const candidates = [
    path.resolve(process.cwd(), '..', '..', 'data', 'artifacts'),
    path.resolve(process.cwd(), 'data', 'artifacts'),
    path.resolve(process.cwd(), 'public', 'artifacts'),
    path.resolve(process.cwd(), 'apps', 'web', 'public', 'artifacts'),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, 'platform.json'))) return dir;
  }
  throw new Error('artifacts not built; run npm run data:build');
}

export function readArtifact<T>(relativePath: string): T {
  const full = path.join(artifactRoot(), ...relativePath.split('/'));
  const raw = fs.readFileSync(full, 'utf8');
  return JSON.parse(raw) as T;
}

export type PlatformArtifact = {
  sourceSha256: string;
  sessions_total: number;
  merchants_total: number;
  verified_try_session_gap: number;
  terminal: Record<string, { n: number; amount: number }>;
  revenue_rial: number;
  orders: number;
  aov: number;
  paid_pending_rial: number;
  fee_realized_rial: number;
  recoverable_expected_rial: number;
  low_coverage_days: number;
  optimal_retry_cap: number;
  hazard: { k: number; at_risk: number; won: number; h: number; ci: [number, number] | null }[];
  daily: { day: string; sessions: number; low: boolean }[];
  jalali_months: {
    key: string;
    days: number;
    revenue_rial: number;
    orders: number;
    per_day_revenue: number;
    per_day_orders: number;
    aov: number;
  }[];
  weekdays?: {
    weekday: number;
    sessions: number;
    revenue_rial: number;
    orders: number;
    aov: number;
  }[];
};

export type MerchantIndexRow = {
  key: string;
  category: string;
  sessions: number;
  verified: number;
  success_rate: number;
  revenue_rial: number;
  health: string;
  tier: 'rich' | 'limited' | 'sparse';
  recoverable_rial: number;
};

export type MerchantArtifact = MerchantIndexRow & {
  no_attempt: number;
  in_bank: number;
  failed: number;
  paid_pending: number;
  paid_amount_rial: number;
  median_amount: number;
  aov: number | null;
  fee_actual: number | null;
  fee_expected: number | null;
  tariff_effect: number | null;
  fee_realized: number;
  fee_potential: number;
  peers: { n: number; p75: number; gap: number } | null;
  impact: {
    currency: string;
    expected: number;
    conservative: number;
    optimistic: number;
    basis: string;
  } | null;
  pending: { currency: string; rial: number };
  unique_prices?: number;
  customers?: number;
  repeat_customers?: number;
  repeat_order_share?: number | null;
  business_model?: string | null;
  case_family?: string | null;
};

export function tryReadArtifact<T>(relativePath: string): T | null {
  try {
    return readArtifact<T>(relativePath);
  } catch {
    return null;
  }
}

export type ReconArtifact = {
  no_attempt_plus_attempted: number;
  sessions_total: number;
  attempted_identity?: number;
  attempted?: number;
  terminal_sum?: number;
  revenue: number;
  category_revenue?: number;
  merchant_revenue?: number;
  month_revenue?: number;
  recoverable_sum: number;
  impact_sum?: number;
  fee_realized_rial?: number;
  fee_session_total?: number;
  verified_gap: number;
  sourceSha256: string;
};

export type PassportArtifact = {
  id: string;
  metricId: string;
  grain: string;
  sql: string;
  n: number;
  sourceSha256: string;
};

export type CaseRow = { key: string; family: string; impactRial: number };

