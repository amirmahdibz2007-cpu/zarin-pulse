import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isoToJalali, jalaliWeekdayIso } from '@zarinpulse/contracts';
import {
  assignCustomerTiers,
  assignImpactFamily,
  classifyBusinessModel,
  recoverableSales,
  resolveAovBasis,
  type AmountBandId,
  type CardValue,
  wilsonInterval,
} from '@zarinpulse/analytics';
import { assertClose, assertEqual, GOLDEN } from './golden.ts';
import { pipelineSql } from './sql.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../../..');

type Row = Record<string, unknown>;

function num(v: unknown): number {
  if (typeof v === 'bigint') return Number(v);
  if (typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (v === null || v === undefined) return 0;
  const n = Number(v);
  if (!Number.isFinite(n)) throw new RangeError(`not a number: ${String(v)}`);
  return n;
}

function rate(n: number): number {
  return Math.round(n * 1e12) / 1e12;
}

function str(v: unknown): string {
  if (v === null || v === undefined) return '';
  return String(v);
}

function sha256Bytes(buf: Buffer): string {
  return createHash('sha256').update(buf).digest('hex');
}

function writeJson(filePath: string, value: unknown): string {
  const text = `${JSON.stringify(value, null, 2).replaceAll('\r\n', '\n')}\n`;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, text, 'utf8');
  return sha256Bytes(Buffer.from(text, 'utf8'));
}

async function loadDuck() {
  try {
    return await import('@duckdb/node-api');
  } catch (err) {
    throw new Error(
      `DuckDB is required for data:build. Install optional dependency @duckdb/node-api. ${String(err)}`,
    );
  }
}

async function allRows(connection: {
  runAndReadAll: (sql: string) => Promise<{ getRowObjectsJS?: () => Row[]; getRowObjects?: () => Row[] }>;
}, sql: string): Promise<Row[]> {
  const reader = await connection.runAndReadAll(sql);
  if (typeof reader.getRowObjectsJS === 'function') return reader.getRowObjectsJS();
  if (typeof reader.getRowObjects === 'function') return reader.getRowObjects();
  throw new Error('DuckDB reader has no getRowObjectsJS/getRowObjects');
}

function p75(values: number[]): number {
  if (values.length === 0) throw new RangeError('p75 of empty');
  const s = [...values].sort((a, b) => a - b);
  const idx = Math.min(s.length - 1, Math.floor(s.length * 0.75));
  return s[idx] ?? 0;
}

function decile(sorted: number[], value: number): number {
  if (sorted.length === 0) return 0;
  const rank = sorted.filter((x) => x <= value).length / sorted.length;
  return Math.min(9, Math.floor(rank * 10));
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)] ?? 0;
}

export async function buildArtifacts(outDir = path.join(repoRoot, 'data', 'artifacts')): Promise<void> {
  const csvPath = path.join(repoRoot, 'data', 'raw', 'challenge_data.csv.gz');
  if (!fs.existsSync(csvPath)) {
    throw new Error(`missing source csv: ${csvPath}`);
  }
  const sourceSha256 = sha256Bytes(fs.readFileSync(csvPath));

  const duck = await loadDuck();
  const instance = await duck.DuckDBInstance.create(':memory:');
  const connection = await instance.connect();
  await connection.run('SET threads TO 1');
  await connection.run(pipelineSql(csvPath));

  const q = (sql: string) => allRows(connection, sql);

  const rowCount = num((await q('SELECT COUNT(*) AS n FROM tries'))[0]?.n);
  const sessionCount = num((await q('SELECT COUNT(*) AS n FROM sessions'))[0]?.n);
  const merchantCount = num((await q('SELECT COUNT(DISTINCT merchant_key) AS n FROM sessions'))[0]?.n);
  const categoryCount = num((await q('SELECT COUNT(DISTINCT category_title) AS n FROM sessions'))[0]?.n);
  const pspCount = num(
    (await q(`SELECT COUNT(DISTINCT psp_code) AS n FROM tries WHERE psp_code IS NOT NULL AND psp_code <> ''`))[0]
      ?.n,
  );

  assertEqual('rows_total', rowCount, GOLDEN.rows_total);
  assertEqual('sessions_total', sessionCount, GOLDEN.sessions_total);
  assertEqual('merchants_total', merchantCount, GOLDEN.merchants_total);
  assertEqual('categories_total', categoryCount, GOLDEN.categories_total);
  assertEqual('distinct_psp', pspCount, GOLDEN.distinct_psp);

  const amountConflicts = num(
    (await q(`SELECT COUNT(*) AS n FROM (SELECT session_key FROM tries GROUP BY session_key HAVING COUNT(DISTINCT amount) > 1)`))[0]
      ?.n,
  );
  assertEqual('amount_conflicts', amountConflicts, GOLDEN.amount_conflicts);

  const tryStatusRows = await q(
    `SELECT try_status, COUNT(*) AS n FROM tries GROUP BY 1`,
  );
  const tryStatus: Record<string, number> = {};
  for (const row of tryStatusRows) tryStatus[str(row.try_status)] = num(row.n);
  assertEqual('try_verified', tryStatus['Verified'] ?? 0, GOLDEN.try_status.Verified);
  assertEqual('try_inbank', tryStatus['InBank'] ?? 0, GOLDEN.try_status.InBank);
  assertEqual('try_noattempt', tryStatus['NoAttempt'] ?? 0, GOLDEN.try_status.NoAttempt);
  assertEqual('try_failed', tryStatus['Failed'] ?? 0, GOLDEN.try_status.Failed);
  assertEqual('try_paid', tryStatus['Paid'] ?? 0, GOLDEN.try_status.Paid);

  const sessionVerified = num(
    (await q(`SELECT COUNT(*) AS n FROM sessions WHERE session_status = 'Verified'`))[0]?.n,
  );
  const tryVerifiedSessions = num(
    (await q(`SELECT COUNT(*) AS n FROM sessions WHERE winning_try IS NOT NULL`))[0]?.n,
  );
  assertEqual('session_verified', sessionVerified, GOLDEN.session_verified);
  assertEqual('sessions_with_try_verified', tryVerifiedSessions, GOLDEN.sessions_with_try_verified);
  assertEqual('verified_gap', sessionVerified - tryVerifiedSessions, GOLDEN.verified_try_session_gap);

  const terminalRows = await q(
    `SELECT terminal_state, COUNT(*) AS n, SUM(amount) AS amt FROM terminal_state GROUP BY 1`,
  );
  const terminal: Record<string, { n: number; amount: number }> = {};
  for (const row of terminalRows) {
    terminal[str(row.terminal_state)] = { n: num(row.n), amount: num(row.amt) };
  }
  assertEqual('term_noattempt', terminal['NoAttempt']?.n ?? 0, GOLDEN.terminal.NoAttempt);
  assertEqual('term_verified_try', terminal['Verified']?.n ?? 0, GOLDEN.terminal.Verified);
  assertEqual('term_inbank', terminal['InBank']?.n ?? 0, GOLDEN.terminal.InBank);
  assertEqual('term_failed', terminal['Failed']?.n ?? 0, GOLDEN.terminal.Failed);
  assertEqual('term_paid', terminal['Paid']?.n ?? 0, GOLDEN.terminal.Paid);

  const paidSessions = num(
    (await q(`SELECT COUNT(*) AS n FROM sessions WHERE session_status = 'Paid'`))[0]?.n,
  );
  assertEqual('paid_sessions', paidSessions, GOLDEN.paid_sessions);

  const revenue = num(
    (await q(`SELECT SUM(amount) AS n FROM sessions WHERE session_status = 'Verified'`))[0]?.n,
  );
  const paidAmount = num(
    (await q(`SELECT SUM(amount) AS n FROM sessions WHERE session_status = 'Paid'`))[0]?.n,
  );
  assertEqual('revenue_total_rial', revenue, GOLDEN.revenue_total_rial);
  assertEqual('paid_pending_amount_rial', paidAmount, GOLDEN.paid_pending_amount_rial);

  const lowDays = num(
    (await q(`SELECT COUNT(*) AS n FROM daily_coverage WHERE is_low_coverage`))[0]?.n,
  );
  assertEqual('low_coverage_days', lowDays, GOLDEN.low_coverage_days);

  const hazardRows = await q(`SELECT k, at_risk, won FROM retry_hazard ORDER BY k`);
  const h1 = hazardRows.find((r) => num(r.k) === 1);
  const h2 = hazardRows.find((r) => num(r.k) === 2);
  assertEqual('h1_at_risk', num(h1?.at_risk), GOLDEN.hazard.h1_at_risk);
  assertEqual('h1_won', num(h1?.won), GOLDEN.hazard.h1_won);
  assertEqual('h2_at_risk', num(h2?.at_risk), GOLDEN.hazard.h2_at_risk);
  assertEqual('h2_won', num(h2?.won), GOLDEN.hazard.h2_won);
  const lastWin = Math.max(
    0,
    ...hazardRows.filter((r) => num(r.won) > 0).map((r) => num(r.k)),
  );
  assertEqual('last_success_k', lastWin, GOLDEN.hazard.last_success_k);
  const h1Rate = num(h1?.won) / num(h1?.at_risk);
  const h2Rate = num(h2?.won) / num(h2?.at_risk);
  assertClose('h1_rate', h1Rate, 0.5481, 0.0002);
  assertClose('h2_rate', h2Rate, 0.4173, 0.0002);

  const zeroVerified = num(
    (await q(`SELECT COUNT(*) AS n FROM gateway_health WHERE verified = 0 AND sessions >= 100`))[0]
      ?.n,
  );
  assertEqual('zero_verified_ge_100', zeroVerified, GOLDEN.gateway.zero_verified_ge_100);

  const below10 = num(
    (await q(
      `SELECT COUNT(*) AS n FROM funnel WHERE sessions >= 100 AND verified::DOUBLE / sessions < 0.10`,
    ))[0]?.n,
  );
  assertEqual('merchants_below_10pct', below10, GOLDEN.gateway.degraded_or_worse_below_10pct);

  const feeMin = num(
    (await q(`SELECT MIN(adjusted_fee) AS n FROM tries WHERE session_status = 'Verified'`))[0]?.n,
  );
  assertEqual('fee_min', feeMin, GOLDEN.fee_min);

  const feeRealized = num(
    (await q(`SELECT SUM(adjusted_fee) AS n FROM sessions WHERE session_status = 'Verified'`))[0]?.n,
  );
  assertEqual('fee_realized_rial', feeRealized, GOLDEN.fee_realized_rial);

  const m250 = num((await q(`SELECT sessions AS n FROM funnel WHERE merchant_key = 'M250'`))[0]?.n);
  assertEqual('m250_sessions', m250, GOLDEN.concentration.m250_sessions);

  const funnelRows = await q(`SELECT * FROM funnel`);
  const healthRows = await q(`SELECT * FROM gateway_health`);
  const feeRows = await q(`SELECT * FROM fee_drag`);
  const repeatRows = await q(`SELECT * FROM merchant_repeat`);
  const healthBy = Object.fromEntries(healthRows.map((r) => [str(r.merchant_key), r]));
  const feeBy = Object.fromEntries(feeRows.map((r) => [str(r.merchant_key), r]));
  const repeatBy = Object.fromEntries(repeatRows.map((r) => [str(r.merchant_key), r]));

  type MerchantStat = {
    key: string;
    category: string;
    sessions: number;
    verified: number;
    no_attempt: number;
    in_bank: number;
    failed: number;
    paid_pending: number;
    revenue_rial: number;
    paid_amount_rial: number;
    attempted_amount_rial: number;
    median_amount: number;
    unique_prices: number;
    success_rate: number;
    aov: number | null;
    health: string;
    fee_actual: number | null;
    fee_expected: number | null;
    tariff_effect: number | null;
    fee_realized: number;
    fee_potential: number;
    customers: number;
    repeat_customers: number;
    repeat_order_share: number | null;
    business_model: string | null;
  };

  const merchants: MerchantStat[] = funnelRows.map((r) => {
    const key = str(r.merchant_key);
    const sessions = num(r.sessions);
    const verified = num(r.verified);
    const health = str(healthBy[key]?.health || 'healthy');
    const fee = feeBy[key];
    const rep = repeatBy[key];
    const customers = rep ? num(rep.customers) : 0;
    const repeatCustomers = rep ? num(rep.repeat_customers) : 0;
    const repeatShare = customers > 0 ? repeatCustomers / customers : null;
    const business_model = classifyBusinessModel({
      repeatCustomerShare: repeatShare ?? 0,
      medianGapDays: 30,
      verifiedOrders: verified,
    });
    return {
      key,
      category: str(r.category_title),
      sessions,
      verified,
      no_attempt: num(r.no_attempt),
      in_bank: num(r.in_bank),
      failed: num(r.failed),
      paid_pending: num(r.paid_pending),
      revenue_rial: num(r.revenue_rial),
      paid_amount_rial: num(r.paid_amount_rial),
      attempted_amount_rial: num(r.attempted_amount_rial),
      median_amount: num(r.median_amount),
      unique_prices: num(r.unique_prices),
      success_rate: sessions === 0 ? 0 : rate(verified / sessions),
      aov: verified > 0 ? rate(num(r.revenue_rial) / verified) : null,
      health,
      fee_actual: fee ? rate(num(fee.actual_rate)) : null,
      fee_expected: fee ? rate(num(fee.expected_rate)) : null,
      tariff_effect: fee ? rate(num(fee.tariff_effect)) : null,
      fee_realized: num(r.fee_realized),
      fee_potential: num(r.fee_potential),
      customers,
      repeat_customers: repeatCustomers,
      repeat_order_share: rep && rep.repeat_order_share !== null ? rate(num(rep.repeat_order_share)) : null,
      business_model,
    };
  });

  const byCat: Record<string, MerchantStat[]> = {};
  for (const m of merchants) {
    const list = byCat[m.category] ?? [];
    list.push(m);
    byCat[m.category] = list;
  }

  const eligible = merchants.filter((m) => m.sessions >= 100);
  let peerCovered = 0;
  const peerOf: Record<string, { n: number; p75: number; gap: number }> = {};
  for (const m of eligible) {
    const pool = (byCat[m.category] ?? []).filter((o) => o.key !== m.key && o.sessions >= 100);
    const meds = pool.map((o) => o.median_amount).sort((a, b) => a - b);
    const dm = decile(meds, m.median_amount);
    const peers = pool.filter((o) => Math.abs(decile(meds, o.median_amount) - dm) <= 2);
    if (peers.length >= 5) {
      peerCovered += 1;
      const p = p75(peers.map((o) => o.success_rate));
      peerOf[m.key] = { n: peers.length, p75: rate(p), gap: rate(p - m.success_rate) };
    }
  }
  if (peerCovered < 150) {
    throw new Error(`peer coverage too low: ${peerCovered} (expected ≥150 of 156)`);
  }

  const recoverableBy: Record<string, { expected: number; conservative: number; optimistic: number; basis: string }> =
    {};
  for (const m of eligible) {
    const peers = peerOf[m.key];
    if (!peers || peers.gap <= 0) continue;
    const resolved = resolveAovBasis({
      verifiedOrders: m.verified,
      ownAov: m.aov,
      medianAttemptedAmount: m.median_amount,
      peerAov: median((byCat[m.category] ?? []).map((o) => o.aov ?? 0).filter((x) => x > 0)),
    });
    if (resolved.aov === null) continue;
    const expected = recoverableSales({
      targetRate: peers.p75,
      currentRate: m.success_rate,
      sessions: m.sessions,
      aov: resolved.aov,
      captureRate: 0.5,
    });
    recoverableBy[m.key] = {
      expected: Math.round(expected),
      conservative: Math.round(expected * 0.6),
      optimistic: Math.round(expected * 1.4),
      basis: resolved.basis,
    };
  }

  const m106 = merchants.find((m) => m.key === 'M106');
  if (m106?.fee_actual !== null && m106?.fee_actual !== undefined) {
    assertClose('m106_actual_rate', m106.fee_actual, 0.081132, 0.0002);
  }
  if (m106?.tariff_effect !== null && m106?.tariff_effect !== undefined) {
    if (!(m106.tariff_effect > 0.01)) {
      throw new Error(`m106_tariff_effect should be a material surcharge, got ${m106.tariff_effect}`);
    }
  }

  const cases = Object.entries(recoverableBy)
    .map(([key, rec]) => {
      const m = merchants.find((row) => row.key === key);
      if (!m) throw new Error(`missing merchant for case ${key}`);
      return {
        key,
        family: assignImpactFamily({
          health: m.health,
          noAttemptRate: m.sessions === 0 ? 0 : m.no_attempt / m.sessions,
          inBankRate: m.sessions === 0 ? 0 : m.in_bank / m.sessions,
          uniquePrices: m.unique_prices,
        }),
        impactRial: rec.expected,
      };
    })
    .sort((a, b) => a.key.localeCompare(b.key));
  const recoverableSumRounded = Object.values(recoverableBy).reduce((a, v) => a + v.expected, 0);
  const impactSum = cases.reduce((a, c) => a + c.impactRial, 0);
  if (impactSum !== recoverableSumRounded) {
    throw new Error(`impact union broken: ${impactSum} vs ${recoverableSumRounded}`);
  }

  const dailyRows = await q(
    `SELECT CAST(day AS VARCHAR) AS day, sessions, is_low_coverage FROM daily_coverage ORDER BY day`,
  );
  const daily = dailyRows.map((r) => ({
    day: str(r.day).slice(0, 10),
    sessions: num(r.sessions),
    low: Boolean(r.is_low_coverage),
  }));

  const monthMap: Record<string, { days: Set<string>; revenue: number; orders: number }> = {};
  const monthRev = await q(`
    SELECT CAST(CAST(created_at AS DATE) AS VARCHAR) AS day,
           SUM(CASE WHEN session_status='Verified' THEN amount ELSE 0 END) AS revenue,
           COUNT(*) FILTER (WHERE session_status='Verified') AS orders
    FROM sessions
    GROUP BY 1
  `);
  for (const row of monthRev) {
    const day = str(row.day).slice(0, 10);
    const j = isoToJalali(day);
    const key = `${j.year}-${String(j.month).padStart(2, '0')}`;
    monthMap[key] ??= { days: new Set(), revenue: 0, orders: 0 };
    const bucket = monthMap[key];
    if (!bucket) continue;
    bucket.days.add(day);
    bucket.revenue += num(row.revenue);
    bucket.orders += num(row.orders);
  }

  const pspRows = await q(`
    SELECT COALESCE(psp_code,'NONE') AS psp_code, COUNT(*) AS n,
           COUNT(*) FILTER (WHERE try_status='Verified') AS won
    FROM tries WHERE try_seq > 0
    GROUP BY 1 ORDER BY n DESC
  `);

  const catRows = await q(`
    SELECT category_title,
           COUNT(DISTINCT merchant_key) AS merchants,
           COUNT(*) FILTER (WHERE session_status='Verified') AS orders,
           SUM(CASE WHEN session_status='Verified' THEN amount ELSE 0 END) AS revenue,
           COUNT(*) AS sessions,
           COUNT(*) FILTER (WHERE session_status='Verified')::DOUBLE / COUNT(*) AS success
    FROM sessions
    GROUP BY 1
  `);

  const hazard = hazardRows.map((r) => {
    const at_risk = num(r.at_risk);
    const won = num(r.won);
    const [lo, hi] = at_risk >= 100 ? wilsonInterval(won, at_risk) : [null, null];
    return { k: num(r.k), at_risk, won, h: at_risk === 0 ? 0 : rate(won / at_risk), ci: lo === null ? null : [rate(lo), rate(hi)] };
  });

  const weekdayMap: Record<number, { sessions: number; revenue: number; orders: number }> = {};
  for (const row of monthRev) {
    const day = str(row.day).slice(0, 10);
    const wd = jalaliWeekdayIso(day);
    weekdayMap[wd] ??= { sessions: 0, revenue: 0, orders: 0 };
    const bucket = weekdayMap[wd];
    if (!bucket) continue;
    bucket.revenue += num(row.revenue);
    bucket.orders += num(row.orders);
  }
  const dailySessionsByDay = Object.fromEntries(daily.map((d) => [d.day, d.sessions]));
  for (const row of monthRev) {
    const day = str(row.day).slice(0, 10);
    const wd = jalaliWeekdayIso(day);
    const bucket = weekdayMap[wd];
    if (!bucket) continue;
    bucket.sessions += dailySessionsByDay[day] ?? 0;
  }

  const pspCatRows = await q(`SELECT * FROM psp_category_cross`);
  const feeRefRows = await q(`SELECT band, ref_rate, n FROM fee_ref ORDER BY band`);
  const feeSessionTotal = num((await q(`SELECT SUM(adjusted_fee) AS n FROM sessions`))[0]?.n);
  const spikeRows = await q(`
    SELECT merchant_key, SUM(amount) AS revenue
    FROM sessions
    WHERE CAST(created_at AS DATE) = DATE '2026-06-23'
      AND session_status = 'Verified'
    GROUP BY 1
    ORDER BY revenue DESC
    LIMIT 8
  `);

  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(path.join(outDir, 'merchants'), { recursive: true });
  fs.mkdirSync(path.join(outDir, 'passports'), { recursive: true });

  const files: Record<string, string> = {};

  const platform = {
    sourceSha256,
    rows_total: rowCount,
    sessions_total: sessionCount,
    merchants_total: merchantCount,
    categories_total: categoryCount,
    distinct_psp: pspCount,
    verified_try_session_gap: sessionVerified - tryVerifiedSessions,
    terminal,
    session_status: {
      verified: sessionVerified,
      paid: paidSessions,
      no_attempt: GOLDEN.no_attempt,
    },
    revenue_rial: revenue,
    orders: sessionVerified,
    aov: rate(revenue / sessionVerified),
    paid_pending_rial: paidAmount,
    fee_realized_rial: feeRealized,
    recoverable_expected_rial: recoverableSumRounded,
    low_coverage_days: lowDays,
    hazard,
    optimal_retry_cap: 2,
    daily,
    weekdays: Object.entries(weekdayMap)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([k, v]) => ({
      weekday: Number(k),
      sessions: v.sessions,
      revenue_rial: v.revenue,
      orders: v.orders,
      aov: v.orders === 0 ? 0 : rate(v.revenue / v.orders),
    })),
    jalali_months: Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, v]) => ({
      key,
      days: v.days.size,
      revenue_rial: v.revenue,
      orders: v.orders,
      per_day_revenue: rate(v.revenue / v.days.size),
      per_day_orders: rate(v.orders / v.days.size),
      aov: v.orders === 0 ? 0 : rate(v.revenue / v.orders),
    })),
  };
  files['platform.json'] = writeJson(path.join(outDir, 'platform.json'), platform);

  files['categories.json'] = writeJson(
    path.join(outDir, 'categories.json'),
    catRows
      .map((r) => ({
        title: str(r.category_title),
        merchants: num(r.merchants),
        orders: num(r.orders),
        sessions: num(r.sessions),
        revenue_rial: num(r.revenue),
        aov: num(r.orders) === 0 ? 0 : rate(num(r.revenue) / num(r.orders)),
        success_rate: rate(num(r.success)),
      }))
      .sort((a, b) => a.title.localeCompare(b.title)),
  );

  files['psp.json'] = writeJson(
    path.join(outDir, 'psp.json'),
    pspRows.map((r) => ({
      psp: str(r.psp_code),
      n: num(r.n),
      won: num(r.won),
      rate: num(r.n) === 0 ? 0 : rate(num(r.won) / num(r.n)),
    })),
  );

  const index = merchants
    .sort((a, b) => b.sessions - a.sessions)
    .map((m) => ({
      key: m.key,
      category: m.category,
      sessions: m.sessions,
      verified: m.verified,
      success_rate: m.success_rate,
      revenue_rial: m.revenue_rial,
      health: m.health,
      tier: m.verified >= 500 ? 'rich' : m.sessions >= 100 ? 'limited' : 'sparse',
      recoverable_rial: recoverableBy[m.key]?.expected ?? 0,
    }));
  files['merchants-index.json'] = writeJson(path.join(outDir, 'merchants-index.json'), index);

  files['peers.json'] = writeJson(
    path.join(outDir, 'peers.json'),
    Object.fromEntries(Object.entries(peerOf).sort(([a], [b]) => a.localeCompare(b))),
  );
  files['fees.json'] = writeJson(
    path.join(outDir, 'fees.json'),
    merchants
      .slice()
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((m) => ({
      key: m.key,
      actual: m.fee_actual,
      expected: m.fee_expected,
      tariff_effect: m.tariff_effect,
      realized: m.fee_realized,
      potential: m.fee_potential,
    })),
  );

  const recon = {
    no_attempt_plus_attempted: GOLDEN.no_attempt + GOLDEN.attempted,
    sessions_total: sessionCount,
    attempted_identity:
      GOLDEN.session_verified + GOLDEN.paid_sessions + GOLDEN.reversed_sessions + GOLDEN.failed_after_attempt,
    attempted: GOLDEN.attempted,
    terminal_sum: Object.values(terminal).reduce((a, v) => a + v.n, 0),
    revenue: revenue,
    category_revenue: catRows.reduce((a, r) => a + num(r.revenue), 0),
    merchant_revenue: merchants.reduce((a, m) => a + m.revenue_rial, 0),
    month_revenue: Object.values(monthMap).reduce((a, v) => a + v.revenue, 0),
    recoverable_sum: recoverableSumRounded,
    impact_sum: impactSum,
    fee_realized_rial: feeRealized,
    fee_session_total: feeSessionTotal,
    verified_gap: sessionVerified - tryVerifiedSessions,
    sourceSha256,
  };
  files['reconciliation.json'] = writeJson(path.join(outDir, 'reconciliation.json'), recon);
  files['cases.json'] = writeJson(path.join(outDir, 'cases.json'), cases);
  files['psp-category.json'] = writeJson(
    path.join(outDir, 'psp-category.json'),
    pspCatRows
      .map((r) => ({
        category: str(r.category_title),
        psp: str(r.psp_code),
        n: num(r.tries_n),
        won: num(r.won),
        rate: num(r.tries_n) === 0 ? 0 : rate(num(r.won) / num(r.tries_n)),
      }))
      .sort((a, b) => a.category.localeCompare(b.category) || a.psp.localeCompare(b.psp)),
  );
  files['fee-ref.json'] = writeJson(
    path.join(outDir, 'fee-ref.json'),
    feeRefRows.map((r) => ({ band: rate(num(r.band)), ref_rate: rate(num(r.ref_rate)), n: num(r.n) })),
  );
  files['spike-2026-06-23.json'] = writeJson(
    path.join(outDir, 'spike-2026-06-23.json'),
    spikeRows.map((r) => ({ key: str(r.merchant_key), revenue_rial: num(r.revenue) })),
  );
  files['paid-pending.json'] = writeJson(
    path.join(outDir, 'paid-pending.json'),
    merchants
      .filter((m) => m.paid_amount_rial > 0)
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((m) => ({ key: m.key, paid_pending: m.paid_pending, paid_amount_rial: m.paid_amount_rial })),
  );
  files['at-risk.json'] = writeJson(
    path.join(outDir, 'at-risk.json'),
    merchants
      .filter((m) => m.business_model === 'subscription_like')
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((m) => ({
        key: m.key,
        customers: m.customers,
        repeat_customers: m.repeat_customers,
        repeat_order_share: m.repeat_order_share,
      })),
  );

  const merchantDayRows = await q(`
    SELECT merchant_key,
           CAST(CAST(created_at AS DATE) AS VARCHAR) AS day,
           COUNT(*) AS sessions,
           COUNT(*) FILTER (WHERE session_status='Verified') AS orders,
           COALESCE(SUM(CASE WHEN session_status='Verified' THEN amount ELSE 0 END), 0) AS revenue
    FROM sessions
    GROUP BY 1, 2
  `);

  type MerchantDayPoint = {
    day: string;
    sessions: number;
    revenue_rial: number;
    orders: number;
  };
  const daysByMerchant: Record<string, MerchantDayPoint[]> = {};
  for (const row of merchantDayRows) {
    const key = str(row.merchant_key);
    daysByMerchant[key] ??= [];
    daysByMerchant[key].push({
      day: str(row.day).slice(0, 10),
      sessions: num(row.sessions),
      revenue_rial: num(row.revenue),
      orders: num(row.orders),
    });
  }
  for (const key of Object.keys(daysByMerchant)) {
    daysByMerchant[key]!.sort((a, b) => a.day.localeCompare(b.day));
  }

  const DATA_END_ISO = '2026-06-30';
  const EXPORT_MERCHANT = 'M31';
  const BAND_ORDER: AmountBandId[] = ['lt_0_5m', '0_5_2m', '2_5m', '5_10m', '10m_plus'];

  const cardRows = await q(`
    SELECT
      merchant_key,
      CAST(payer_card_key AS VARCHAR) AS card_key,
      COUNT(*) FILTER (WHERE session_status = 'Verified') AS orders,
      COALESCE(SUM(CASE WHEN session_status = 'Verified' THEN amount ELSE 0 END), 0) AS revenue,
      CAST(MAX(CASE WHEN session_status = 'Verified' THEN CAST(created_at AS DATE) END) AS VARCHAR) AS last_day,
      CAST(MIN(CASE WHEN session_status = 'Verified' THEN CAST(created_at AS DATE) END) AS VARCHAR) AS first_day
    FROM sessions
    WHERE payer_card_key IS NOT NULL AND CAST(payer_card_key AS VARCHAR) <> ''
    GROUP BY 1, 2
    HAVING COUNT(*) FILTER (WHERE session_status = 'Verified') > 0
  `);

  const cardsByMerchant: Record<string, CardValue[]> = {};
  for (const row of cardRows) {
    const key = str(row.merchant_key);
    cardsByMerchant[key] ??= [];
    cardsByMerchant[key]!.push({
      cardKey: str(row.card_key),
      orders: num(row.orders),
      revenueRial: num(row.revenue),
      lastOrderIso: str(row.last_day).slice(0, 10),
      firstOrderIso: str(row.first_day).slice(0, 10),
    });
  }

  const bandRows = await q(`
    SELECT
      merchant_key,
      CASE
        WHEN amount < 500000 THEN 'lt_0_5m'
        WHEN amount < 2000000 THEN '0_5_2m'
        WHEN amount < 5000000 THEN '2_5m'
        WHEN amount < 10000000 THEN '5_10m'
        ELSE '10m_plus'
      END AS band,
      COUNT(*) AS sessions,
      COUNT(*) FILTER (WHERE session_status = 'Verified') AS verified,
      COALESCE(SUM(CASE WHEN session_status = 'Verified' THEN amount ELSE 0 END), 0) AS revenue
    FROM sessions
    GROUP BY 1, 2
  `);

  type BandAcc = { sessions: number; verified: number; revenue_rial: number };
  const bandsByMerchant: Record<string, Record<string, BandAcc>> = {};
  for (const row of bandRows) {
    const key = str(row.merchant_key);
    bandsByMerchant[key] ??= {};
    bandsByMerchant[key]![str(row.band)] = {
      sessions: num(row.sessions),
      verified: num(row.verified),
      revenue_rial: num(row.revenue),
    };
  }

  type OpsPayload = {
    customer_tiers: {
      gold: { customers: number; revenue_rial: number; share_of_revenue: number };
      silver: { customers: number; revenue_rial: number; share_of_revenue: number };
      bronze: { customers: number; revenue_rial: number; share_of_revenue: number };
      at_risk: { customers: number; revenue_rial: number; share_of_revenue: number };
    };
    amount_bands: {
      id: AmountBandId;
      sessions: number;
      verified: number;
      success_rate: number;
      revenue_rial: number;
    }[];
    sales_peaks: {
      top_days: { day: string; orders: number; revenue_rial: number; sessions: number }[];
    };
    psp_mix: { psp: string; sessions: number; verified: number; success_rate: number }[];
  };

  const pspMixRows = await q(`
    SELECT
      merchant_key,
      COALESCE(NULLIF(CAST(psp_code_last AS VARCHAR), ''), '(empty)') AS psp,
      COUNT(*) AS sessions,
      COUNT(*) FILTER (WHERE session_status = 'Verified') AS verified
    FROM terminal_state
    GROUP BY 1, 2
  `);
  const pspByMerchant: Record<string, OpsPayload['psp_mix']> = {};
  for (const row of pspMixRows) {
    const key = str(row.merchant_key);
    const sessions = num(row.sessions);
    pspByMerchant[key] ??= [];
    pspByMerchant[key]!.push({
      psp: str(row.psp),
      sessions,
      verified: num(row.verified),
      success_rate: sessions === 0 ? 0 : rate(num(row.verified) / sessions),
    });
  }
  for (const key of Object.keys(pspByMerchant)) {
    pspByMerchant[key]!.sort((a, b) => b.sessions - a.sessions || a.psp.localeCompare(b.psp));
  }

  const opsByMerchant: Record<string, OpsPayload> = {};
  const tiersByMerchant: Record<string, ReturnType<typeof assignCustomerTiers>> = {};

  for (const m of merchants) {
    const tiers = assignCustomerTiers(cardsByMerchant[m.key] ?? [], DATA_END_ISO);
    tiersByMerchant[m.key] = tiers;
    const bandMap = bandsByMerchant[m.key] ?? {};
    const amount_bands = BAND_ORDER.map((id) => {
      const b = bandMap[id] ?? { sessions: 0, verified: 0, revenue_rial: 0 };
      return {
        id,
        sessions: b.sessions,
        verified: b.verified,
        success_rate: b.sessions === 0 ? 0 : rate(b.verified / b.sessions),
        revenue_rial: b.revenue_rial,
      };
    });
    const daily = daysByMerchant[m.key] ?? [];
    const top_days = [...daily]
      .filter((d) => d.orders > 0)
      .sort((a, b) => b.revenue_rial - a.revenue_rial || b.orders - a.orders)
      .slice(0, 3)
      .map((d) => ({
        day: d.day,
        orders: d.orders,
        revenue_rial: d.revenue_rial,
        sessions: d.sessions,
      }));
    opsByMerchant[m.key] = {
      customer_tiers: {
        gold: {
          customers: tiers.summary.gold.customers,
          revenue_rial: tiers.summary.gold.revenue_rial,
          share_of_revenue: rate(tiers.summary.gold.share_of_revenue),
        },
        silver: {
          customers: tiers.summary.silver.customers,
          revenue_rial: tiers.summary.silver.revenue_rial,
          share_of_revenue: rate(tiers.summary.silver.share_of_revenue),
        },
        bronze: {
          customers: tiers.summary.bronze.customers,
          revenue_rial: tiers.summary.bronze.revenue_rial,
          share_of_revenue: rate(tiers.summary.bronze.share_of_revenue),
        },
        at_risk: {
          customers: tiers.summary.at_risk.customers,
          revenue_rial: tiers.summary.at_risk.revenue_rial,
          share_of_revenue: rate(tiers.summary.at_risk.share_of_revenue),
        },
      },
      amount_bands,
      sales_peaks: { top_days },
      psp_mix: pspByMerchant[m.key] ?? [],
    };
  }

  // Capped row exports for the demo merchant only (keeps artifact size bounded).
  {
    const mKey = EXPORT_MERCHANT;
    const tiers = tiersByMerchant[mKey];
    const peaks = opsByMerchant[mKey]?.sales_peaks.top_days.map((d) => d.day) ?? [];
    const exportDir = path.join(outDir, 'exports', mKey);
    fs.mkdirSync(exportDir, { recursive: true });

    const goldExport = (tiers?.gold ?? [])
      .slice(0, 500)
      .map((c) => ({
        payer_card_key: c.cardKey,
        orders: c.orders,
        revenue_rial: c.revenueRial,
        last_order_day: c.lastOrderIso,
        first_order_day: c.firstOrderIso,
        tier: 'gold',
      }));
    files[`exports/${mKey}/gold-customers.json`] = writeJson(
      path.join(exportDir, 'gold-customers.json'),
      goldExport,
    );

    const atRiskExport = (tiers?.at_risk ?? [])
      .slice(0, 500)
      .map((c) => ({
        payer_card_key: c.cardKey,
        orders: c.orders,
        revenue_rial: c.revenueRial,
        last_order_day: c.lastOrderIso,
        first_order_day: c.firstOrderIso,
        tier: 'at_risk',
      }));
    files[`exports/${mKey}/at-risk-customers.json`] = writeJson(
      path.join(exportDir, 'at-risk-customers.json'),
      atRiskExport,
    );

    const inbankRows = await q(`
      SELECT
        session_key,
        amount,
        CAST(CAST(created_at AS DATE) AS VARCHAR) AS day,
        COALESCE(CAST(payer_card_key AS VARCHAR), '') AS payer_card_key,
        COALESCE(psp_code_last, '') AS psp_code
      FROM terminal_state
      WHERE merchant_key = '${EXPORT_MERCHANT}' AND terminal_state = 'InBank'
      ORDER BY amount DESC, session_key
      LIMIT 1000
    `);
    files[`exports/${mKey}/inbank-sessions.json`] = writeJson(
      path.join(exportDir, 'inbank-sessions.json'),
      inbankRows.map((r) => ({
        session_key: str(r.session_key),
        amount_rial: num(r.amount),
        day: str(r.day).slice(0, 10),
        payer_card_key: str(r.payer_card_key),
        psp_code: str(r.psp_code),
        terminal_state: 'InBank',
      })),
    );

    let peakExport: {
      session_key: string;
      amount_rial: number;
      day: string;
      payer_card_key: string;
      session_status: string;
    }[] = [];
    if (peaks.length > 0) {
      const peakList = peaks.map((d) => `'${d}'`).join(',');
      const peakRows = await q(`
        SELECT
          session_key,
          amount,
          CAST(CAST(created_at AS DATE) AS VARCHAR) AS day,
          COALESCE(CAST(payer_card_key AS VARCHAR), '') AS payer_card_key,
          session_status
        FROM sessions
        WHERE merchant_key = '${EXPORT_MERCHANT}'
          AND session_status = 'Verified'
          AND CAST(created_at AS DATE) IN (${peakList})
        ORDER BY day, amount DESC
        LIMIT 1000
      `);
      peakExport = peakRows.map((r) => ({
        session_key: str(r.session_key),
        amount_rial: num(r.amount),
        day: str(r.day).slice(0, 10),
        payer_card_key: str(r.payer_card_key),
        session_status: str(r.session_status),
      }));
    }
    files[`exports/${mKey}/peak-days-sessions.json`] = writeJson(
      path.join(exportDir, 'peak-days-sessions.json'),
      peakExport,
    );
  }

  function merchantSeries(daily: MerchantDayPoint[]) {
    const monthBuckets: Record<
      string,
      { days: Set<string>; revenue: number; orders: number; sessions: number }
    > = {};
    const weekdayBuckets: Record<number, { sessions: number; revenue: number; orders: number }> = {};
    for (const d of daily) {
      const j = isoToJalali(d.day);
      const monthKey = `${j.year}-${String(j.month).padStart(2, '0')}`;
      monthBuckets[monthKey] ??= { days: new Set(), revenue: 0, orders: 0, sessions: 0 };
      const mb = monthBuckets[monthKey]!;
      mb.days.add(d.day);
      mb.revenue += d.revenue_rial;
      mb.orders += d.orders;
      mb.sessions += d.sessions;
      const wd = jalaliWeekdayIso(d.day);
      weekdayBuckets[wd] ??= { sessions: 0, revenue: 0, orders: 0 };
      const wb = weekdayBuckets[wd]!;
      wb.sessions += d.sessions;
      wb.revenue += d.revenue_rial;
      wb.orders += d.orders;
    }
    return {
      daily,
      jalali_months: Object.entries(monthBuckets)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, v]) => ({
          key,
          days: v.days.size,
          revenue_rial: v.revenue,
          orders: v.orders,
          sessions: v.sessions,
          per_day_revenue: v.days.size === 0 ? 0 : rate(v.revenue / v.days.size),
          aov: v.orders === 0 ? 0 : rate(v.revenue / v.orders),
        })),
      weekdays: Object.entries(weekdayBuckets)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([k, v]) => ({
          weekday: Number(k),
          sessions: v.sessions,
          revenue_rial: v.revenue,
          orders: v.orders,
          aov: v.orders === 0 ? 0 : rate(v.revenue / v.orders),
        })),
    };
  }

  for (const m of merchants) {
    const rec = recoverableBy[m.key];
    const peers = peerOf[m.key];
    const payload = {
      ...m,
      peers: peers ?? null,
      impact: rec
        ? {
            currency: 'recoverable_sales',
            ...rec,
          }
        : null,
      pending: { currency: 'pending_reconciliation', rial: m.paid_amount_rial },
      case_family: cases.find((c) => c.key === m.key)?.family ?? null,
      series: merchantSeries(daysByMerchant[m.key] ?? []),
      ops: opsByMerchant[m.key] ?? null,
    };
    files[`merchants/${m.key}.json`] = writeJson(path.join(outDir, 'merchants', `${m.key}.json`), payload);
  }

  const passports = [
    {
      id: 'session_success_rate@platform',
      metricId: 'session_success_rate',
      grain: 'session',
      sql: "SELECT COUNT(*) FILTER (WHERE session_status='Verified')::DOUBLE / COUNT(*) FROM sessions",
      n: sessionCount,
      sourceSha256,
    },
    {
      id: 'retry_hazard@k1',
      metricId: 'retry_hazard',
      grain: 'try',
      sql: "SELECT won::DOUBLE/at_risk FROM retry_hazard WHERE k=1",
      n: GOLDEN.hazard.h1_at_risk,
      sourceSha256,
    },
    {
      id: 'revenue_rial@platform',
      metricId: 'revenue_rial',
      grain: 'order',
      sql: "SELECT SUM(amount) FROM sessions WHERE session_status='Verified'",
      n: sessionVerified,
      sourceSha256,
    },
  ];
  for (const p of passports) {
    files[`passports/${p.id}.json`] = writeJson(path.join(outDir, 'passports', `${p.id}.json`), p);
  }

  const occasionsRaw = fs.readFileSync(path.join(repoRoot, 'data', 'calendar', 'occasions.json'), 'utf8');
  files['calendar-events.json'] = writeJson(
    path.join(outDir, 'calendar-events.json'),
    JSON.parse(occasionsRaw) as unknown,
  );

  const manifest = {
    builtAt: new Date().toISOString(),
    sourceSha256,
    files,
  };
  writeJson(path.join(outDir, 'manifest.json'), manifest);

  const publicDir = path.join(repoRoot, 'apps', 'web', 'public', 'artifacts');
  if (path.resolve(outDir) === path.resolve(path.join(repoRoot, 'data', 'artifacts'))) {
    fs.rmSync(publicDir, { recursive: true, force: true });
    fs.cpSync(outDir, publicDir, { recursive: true });
  }

  const indexSize = fs.statSync(path.join(outDir, 'merchants-index.json')).size;
  if (indexSize > 100 * 1024) {
    throw new Error(`merchants-index.json is ${indexSize} bytes, budget is 100KB`);
  }
}

export { repoRoot };
