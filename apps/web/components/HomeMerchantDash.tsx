'use client';

import {
  copy,
  count,
  formatBillionsFigure,
  formatBillionsRial,
  formatCount,
  formatRatioAsPercent,
  MONTHS_FA,
  WEEKDAYS_FA,
  WEEKDAYS_FA_SHORT,
} from '@zarinpulse/contracts';
import Link from 'next/link';
import { useState } from 'react';
import type { MerchantArtifact } from '../lib/artifacts';
import { buildMerchantActions } from '../lib/merchant-actions';
import {
  MERCHANT_PERIOD_ORDER,
  sumMerchantPeriod,
  type MerchantPeriodId,
} from '../lib/merchant-periods';
import { ActionBrief } from './ActionBrief';
import { AreaLine, Columns, FunnelStack, MiniRing, Sparkline } from './Charts';
import { LiquidCylinders } from './Infographic';
import { StatusPill } from './StatusPill';

const TERMINAL_SPLIT = ['Verified', 'InBank', 'NoAttempt', 'Failed', 'Paid'] as const;

function cylinderTone(state: (typeof TERMINAL_SPLIT)[number]) {
  if (state === 'Verified') return 'positive' as const;
  if (state === 'InBank') return 'accent' as const;
  if (state === 'Failed') return 'negative' as const;
  if (state === 'Paid') return 'warm' as const;
  return 'muted' as const;
}

function monthLabel(key: string): string {
  const part = key.split('-')[1];
  const idx = Number(part) - 1;
  return MONTHS_FA[idx] ?? key;
}

function densifySeries(values: readonly number[], points: number): number[] {
  if (values.length === 0) return [];
  if (values.length === 1 || points <= values.length) return [...values];
  const out: number[] = [];
  for (let i = 0; i < points; i++) {
    const t = (i / (points - 1)) * (values.length - 1);
    const i0 = Math.floor(t);
    const i1 = Math.min(values.length - 1, i0 + 1);
    const f = t - i0;
    const a = values[i0] ?? 0;
    const b = values[i1] ?? a;
    out.push(a * (1 - f) + b * f);
  }
  return out;
}

function periodLabel(id: MerchantPeriodId): string {
  return copy.homeMerchant.period[id];
}

export function HomeMerchantDash(props: { merchant: MerchantArtifact }) {
  const m = props.merchant;
  const series = m.series;
  const [period, setPeriod] = useState<MerchantPeriodId>('month');

  const periodSum = series
    ? sumMerchantPeriod(series, period)
    : { id: period, revenue_rial: m.revenue_rial, orders: m.verified, partial: true };

  let heroSpark: number[] = [];
  if (series?.daily.length) {
    const windowDays =
      period === 'week'
        ? 7
        : period === 'month'
          ? 31
          : period === 'months3'
            ? 92
            : period === 'months6'
              ? 184
              : series.daily.length;
    const slice = series.daily.slice(-windowDays);
    heroSpark = densifySeries(
      slice.map((d) => d.revenue_rial),
      Math.min(48, Math.max(24, slice.length)),
    );
  } else if (series?.jalali_months.length) {
    heroSpark = densifySeries(
      series.jalali_months.map((row) => row.per_day_revenue),
      36,
    );
  }

  const successRatio = m.sessions > 0 ? m.verified / m.sessions : 0;
  const reachedBank = m.sessions - m.no_attempt;
  const actions = buildMerchantActions(m);
  const lastMonth = series?.jalali_months.at(-1);
  const weekRows = (series?.weekdays ?? []).slice().sort((a, b) => a.weekday - b.weekday);
  const weekSessions = weekRows.reduce((sum, w) => sum + w.sessions, 0);
  const weekPeak = Math.max(1, ...weekRows.map((w) => w.sessions));
  const weekBars = weekRows.map((w) => {
    const share = weekSessions > 0 ? w.sessions / weekSessions : 0;
    return {
      label: WEEKDAYS_FA[w.weekday] ?? String(w.weekday),
      shortLabel: WEEKDAYS_FA_SHORT[w.weekday] ?? String(w.weekday),
      value: w.sessions,
      detail: formatCount(count(w.sessions)),
      meta: `${formatRatioAsPercent(share)} ${copy.dash.weekShare} · ${formatBillionsRial(w.revenue_rial)} · ${formatCount(count(w.orders))} ${copy.dash.weekOrders}`,
      ...(w.sessions === weekPeak ? { badge: copy.dash.weekPeak } : {}),
    };
  });
  const sparkSessions = (series?.daily ?? []).slice(-40).map((d) => d.sessions ?? 0);
  const peerGap = m.peers && m.peers.gap > 0 ? m.peers.gap : 0;
  const terminalCounts: Record<(typeof TERMINAL_SPLIT)[number], number> = {
    Verified: m.verified,
    InBank: m.in_bank,
    NoAttempt: m.no_attempt,
    Failed: m.failed,
    Paid: m.paid_pending,
  };

  return (
    <>
      <header className="dash-hero reveal">
        <p className="page-kicker">
          {copy.homeMerchant.sampleBadge} · {m.key} · {m.category}
        </p>
        <p className="stat-label">
          {copy.homeMerchant.sales} · {periodLabel(period)}
        </p>
        <div className="hero-value-wrap">
          <Sparkline
            values={heroSpark}
            className="spark-watermark spark-watermark-edge"
            stretch
            padBottom={1.35}
          />
          <Sparkline
            values={heroSpark}
            className="spark-watermark spark-watermark-mid"
            stretch
            padBottom={1.35}
          />
          <Sparkline
            values={heroSpark}
            className="spark-watermark spark-watermark-core"
            stretch
            padBottom={1.35}
          />
          <p className="hero-value">{formatBillionsRial(periodSum.revenue_rial)}</p>
        </div>
        <div className="period-chips" role="tablist" aria-label={copy.homeMerchant.sales}>
          {MERCHANT_PERIOD_ORDER.map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={id === period}
              className="period-chip control-neuro"
              data-active={id === period ? 'true' : 'false'}
              onClick={() => setPeriod(id)}
            >
              {periodLabel(id)}
            </button>
          ))}
        </div>
        {periodSum.partial ? (
          <p className="stat-hint">{copy.homeMerchant.periodPartial}</p>
        ) : null}
        <p className="page-lede">
          <Link className="link-quiet font-medium" href={`/m/${m.key}`}>
            {copy.homeMerchant.openDetail}
          </Link>
          {' · '}
          <Link className="link-quiet font-medium" href="/ai">
            {copy.nav.ai}
          </Link>
        </p>
      </header>

      <section className="dash-kpis">
        <article className="stat-card stat-card-floor">
          <p className="stat-label">{copy.dash.sessions}</p>
          <p className="stat-value">{formatCount(count(m.sessions))}</p>
          {sparkSessions.length > 1 ? (
            <Sparkline values={sparkSessions} className="spark-floor" stretch />
          ) : null}
        </article>
        <article className="stat-card stat-card-row">
          <div>
            <p className="stat-label">{copy.terminal.Verified}</p>
            <p className="stat-value stat-value-accent">{formatRatioAsPercent(successRatio)}</p>
          </div>
          <MiniRing ratio={successRatio} ticks size="m" />
        </article>
        <article className="stat-card">
          <p className="stat-label">{copy.dash.pending}</p>
          <p className="stat-value">{formatBillionsRial(m.paid_amount_rial)}</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">{peerGap > 0 ? copy.homeMerchant.vsPeers : copy.homeMerchant.vsPeersOk}</p>
          <p className="stat-value">
            {peerGap > 0 ? formatRatioAsPercent(peerGap) : formatRatioAsPercent(successRatio)}
          </p>
          <StatusPill code={m.health} />
        </article>
      </section>

      <section className="dash-pair">
        <article className="chart-card">
          <h2 className="chart-title">{copy.dash.funnel}</h2>
          <FunnelStack
            drops
            stages={[
              {
                label: copy.dash.opened,
                caption: formatCount(count(m.sessions)),
                ratio: 1,
              },
              {
                label: copy.dash.reachedBank,
                caption: formatRatioAsPercent(m.sessions > 0 ? reachedBank / m.sessions : 0),
                ratio: m.sessions > 0 ? reachedBank / m.sessions : 0,
              },
              {
                label: copy.terminal.Verified,
                caption: formatRatioAsPercent(successRatio),
                ratio: successRatio,
              },
            ]}
          />
        </article>
        <article className="chart-card">
          <h2 className="chart-title">{copy.nav.growth}</h2>
          <p className="stat-hint">{copy.dash.trendUnit}</p>
          {series?.jalali_months?.length ? (
            <AreaLine
              grid
              points={series.jalali_months.map((row) => ({
                label: monthLabel(row.key),
                value: row.per_day_revenue,
              }))}
              {...(lastMonth
                ? {
                    marker: formatBillionsFigure(lastMonth.per_day_revenue),
                    caption: `${monthLabel(lastMonth.key)} · ${formatBillionsRial(lastMonth.per_day_revenue)}`,
                  }
                : {})}
            />
          ) : (
            <p className="stat-hint">{copy.product.skeletonNote}</p>
          )}
        </article>
      </section>

      <section className="dash-pair">
        <article className="chart-card">
          <h2 className="chart-title">{copy.dash.weekCols}</h2>
          {weekBars.length ? (
            <>
              <Columns bars={weekBars} />
              <p className="stat-hint">{copy.dash.weekScale}</p>
            </>
          ) : (
            <p className="stat-hint">{copy.product.skeletonNote}</p>
          )}
        </article>
        <article className="chart-card">
          <h2 className="chart-title">{copy.dash.split}</h2>
          <LiquidCylinders
            series={TERMINAL_SPLIT.map((state) => {
              const n = terminalCounts[state];
              return {
                label: copy.terminalShort[state],
                value: n,
                caption: formatRatioAsPercent(m.sessions > 0 ? n / m.sessions : 0),
                title: copy.terminal[state],
                tone: cylinderTone(state),
              };
            })}
          />
        </article>
      </section>

      <section className="dash-pair">
        <article className="chart-card chart-card-actions">
          <ActionBrief merchantKey={m.key} actions={actions} />
        </article>
      </section>
    </>
  );
}
