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
import { AreaLine, Columns, FunnelStack, MiniRing, RowBar, Sparkline } from './Charts';
import { LiquidCylinders } from './Infographic';
import { PageHeader, PageShell } from './PageShell';
import { ResponsiveTable } from './ResponsiveTable';
import { StatusPill } from './StatusPill';
import { tryReadArtifact, type MerchantIndexRow, type PlatformArtifact } from '../lib/artifacts';

const FUNNEL: Array<keyof typeof copy.terminal> = [
  'Verified',
  'InBank',
  'NoAttempt',
  'Failed',
  'Paid',
];

function cylinderTone(state: (typeof FUNNEL)[number]) {
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

/** Dense polyline through real monthly points (linear interp — same shape, watermark-readable). */
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

export function HomeDash() {
  const platform = tryReadArtifact<PlatformArtifact>('platform.json');
  const index = tryReadArtifact<MerchantIndexRow[]>('merchants-index.json') ?? [];

  if (!platform) {
    return (
      <PageShell width="center">
        <PageHeader title={copy.product.name} lede={copy.product.tagline} />
        <p className="surface-panel text-sm leading-7">{copy.product.skeletonNote}</p>
      </PageShell>
    );
  }

  const verified = platform.terminal.Verified?.n ?? 0;
  const noAttempt = platform.terminal.NoAttempt?.n ?? 0;
  const reachedBank = platform.sessions_total - noAttempt;
  const successRatio = verified / platform.sessions_total;
  const days = Math.max(1, platform.daily.length);
  const dailyAvg = Math.round(platform.sessions_total / days);
  const spark = platform.daily.slice(-40).map((d) => d.sessions);
  const heroSpark = densifySeries(
    platform.jalali_months.map((m) => m.per_day_revenue),
    36,
  );
  const top = index.slice(0, 6);
  const recMax = Math.max(1, ...top.map((m) => m.recoverable_rial));
  const lastMonth = platform.jalali_months.at(-1);
  const weekRows = (platform.weekdays ?? []).slice().sort((a, b) => a.weekday - b.weekday);
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
      badge: w.sessions === weekPeak ? copy.dash.weekPeak : undefined,
    };
  });

  return (
    <PageShell width="wide">
      <header className="dash-hero reveal">
        <p className="page-kicker">{copy.product.name}</p>
        <p className="stat-label">{copy.currency.recoverable_sales}</p>
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
          <p className="hero-value">{formatBillionsRial(platform.recoverable_expected_rial)}</p>
        </div>
        <p className="page-lede">{copy.product.tagline}</p>
      </header>

      <section className="dash-kpis">
        <article className="stat-card stat-card-floor">
          <p className="stat-label">{copy.dash.sessions}</p>
          <p className="stat-value">{formatCount(count(platform.sessions_total))}</p>
          <Sparkline values={spark} className="spark-floor" stretch />
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
          <p className="stat-value">{formatBillionsRial(platform.paid_pending_rial)}</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">{copy.dash.revenue}</p>
          <p className="stat-value">{formatBillionsRial(platform.revenue_rial)}</p>
          <p className="stat-hint">
            {copy.dash.dailyAvg} {formatCount(count(dailyAvg))}
          </p>
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
                caption: formatCount(count(platform.sessions_total)),
                ratio: 1,
              },
              {
                label: copy.dash.reachedBank,
                caption: formatRatioAsPercent(reachedBank / platform.sessions_total),
                ratio: reachedBank / platform.sessions_total,
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
          <AreaLine
            grid
            points={platform.jalali_months.map((m) => ({
              label: monthLabel(m.key),
              value: m.per_day_revenue,
            }))}
            marker={lastMonth ? formatBillionsFigure(lastMonth.per_day_revenue) : undefined}
            caption={
              lastMonth
                ? `${monthLabel(lastMonth.key)} · ${formatBillionsRial(lastMonth.per_day_revenue)}`
                : undefined
            }
          />
        </article>
      </section>

      <section className="dash-pair">
        <article className="chart-card">
          <h2 className="chart-title">{copy.dash.weekCols}</h2>
          <Columns bars={weekBars} />
          <p className="stat-hint">{copy.dash.weekScale}</p>
        </article>
        <article className="chart-card">
          <h2 className="chart-title">{copy.dash.split}</h2>
          <LiquidCylinders
            series={FUNNEL.flatMap((state) => {
              const row = platform.terminal[state];
              if (!row) return [];
              return [
                {
                  label: copy.terminalShort[state],
                  value: row.n,
                  caption: formatRatioAsPercent(row.n / platform.sessions_total),
                  title: copy.terminal[state],
                  tone: cylinderTone(state),
                },
              ];
            })}
          />
        </article>
      </section>

      <p className="text-sm text-[color:var(--zp-muted)]">{copy.impactNoSum}</p>
      <div className="table-recess">
        <ResponsiveTable
          rows={top}
          rowKey={(m) => m.key}
          columns={[
            {
              key: 'm',
              header: copy.dash.merchant,
              cell: (m) => (
                <Link className="link-quiet font-medium" href={`/m/${m.key}`}>
                  {m.key}
                </Link>
              ),
            },
            { key: 'h', header: copy.nav.health, cell: (m) => <StatusPill code={m.health} /> },
            {
              key: 'r',
              header: copy.currency.recoverable_sales,
              cell: (m) => (
                <span className="row-metric">
                  {formatBillionsRial(m.recoverable_rial)}
                  <RowBar value={m.recoverable_rial} max={recMax} />
                </span>
              ),
            },
          ]}
        />
      </div>
      <p className="note-warning surface-panel text-sm leading-7">{copy.feeDisclaimer}</p>
    </PageShell>
  );
}
