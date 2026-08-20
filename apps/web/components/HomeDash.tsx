import {
  copy,
  count,
  formatBillionsRial,
  formatCount,
  formatRatioAsPercent,
  MONTHS_FA,
  WEEKDAYS_FA,
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
  const monthSpark = platform.jalali_months.map((m) => m.per_day_revenue);
  const top = index.slice(0, 6);
  const recMax = Math.max(1, ...top.map((m) => m.recoverable_rial));
  const lastMonth = platform.jalali_months.at(-1);
  const weekBars = (platform.weekdays ?? [])
    .slice()
    .sort((a, b) => a.weekday - b.weekday)
    .map((w) => ({
      label: WEEKDAYS_FA[w.weekday] ?? String(w.weekday),
      value: w.sessions,
    }));

  return (
    <PageShell width="wide">
      <header className="dash-hero reveal">
        <p className="page-kicker">{copy.product.name}</p>
        <p className="stat-label">{copy.currency.recoverable_sales}</p>
        <div className="hero-value-wrap">
          <Sparkline values={spark} className="spark-watermark" stretch />
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
        <article className="stat-card stat-card-floor">
          <p className="stat-label">{copy.dash.revenue}</p>
          <p className="stat-value">{formatBillionsRial(platform.revenue_rial)}</p>
          <p className="stat-hint">
            {copy.dash.dailyAvg} {formatCount(count(dailyAvg))}
          </p>
          <Sparkline values={monthSpark} className="spark-floor" stretch />
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
          <AreaLine
            grid
            points={platform.jalali_months.map((m) => ({
              label: monthLabel(m.key),
              value: m.per_day_revenue,
            }))}
            marker={lastMonth ? formatBillionsRial(lastMonth.per_day_revenue) : undefined}
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
