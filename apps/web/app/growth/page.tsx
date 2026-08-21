import {
  copy,
  formatBillionsFigure,
  formatBillionsRial,
  MONTHS_FA,
} from '@zarinpulse/contracts';
import Link from 'next/link';
import { AreaLine } from '../../components/Charts';
import { PageHeader, PageShell } from '../../components/PageShell';
import { readArtifact, readMerchantArtifact, type PlatformArtifact } from '../../lib/artifacts';
import { HOME_SAMPLE_MERCHANT_KEY } from '../../lib/merchant-periods';

function monthLabel(key: string): string {
  const part = key.split('-')[1];
  const idx = Number(part) - 1;
  return MONTHS_FA[idx] ?? key;
}

export default function GrowthPage() {
  const sample = readMerchantArtifact(HOME_SAMPLE_MERCHANT_KEY);
  const platform = readArtifact<PlatformArtifact>('platform.json');
  const months = sample.series?.jalali_months ?? [];
  const last = months.at(-1);
  const byPerDay = [...months].sort((a, b) => b.per_day_revenue - a.per_day_revenue);
  const peakMonth = byPerDay[0];
  const softMonth = byPerDay.at(-1);
  const peaks = sample.ops?.sales_peaks.top_days ?? [];

  return (
    <PageShell width="wide">
      <PageHeader
        kicker={`${copy.efficacy.sampleKicker} · ${sample.key}`}
        title={copy.nav.growth}
        lede={copy.efficacy.growthDiagnosis}
      />

      <section className="ops-block reveal">
        <p className="ops-block-hint">
          <span className="font-medium">{copy.efficacy.nextStep}: </span>
          {copy.efficacy.growthAction}
        </p>
        <div className="dash-kpis mt-3">
          {peakMonth ? (
            <article className="stat-card">
              <p className="stat-label">{copy.efficacy.growthPeakMonth}</p>
              <p className="stat-value">{monthLabel(peakMonth.key)}</p>
              <p className="stat-hint">{formatBillionsRial(peakMonth.per_day_revenue)}</p>
            </article>
          ) : null}
          {softMonth ? (
            <article className="stat-card">
              <p className="stat-label">{copy.efficacy.growthSoftMonth}</p>
              <p className="stat-value">{monthLabel(softMonth.key)}</p>
              <p className="stat-hint">{formatBillionsRial(softMonth.per_day_revenue)}</p>
            </article>
          ) : null}
        </div>
        {peaks.length > 0 ? (
          <ol className="ops-peak-list mt-4">
            {peaks.map((d, i) => (
              <li key={d.day} className="ops-peak-row">
                <span className="ops-peak-rank">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <p className="ops-peak-day">{d.day}</p>
                  <p className="ops-peak-meta">{formatBillionsRial(d.revenue_rial)}</p>
                </div>
              </li>
            ))}
          </ol>
        ) : null}
        <div className="ops-footer-links">
          <a className="ops-ladder-link" href="/api/download/export?merchant=M31&kind=peak_days">
            {copy.ops.downloadPeaks}
          </a>
          {' · '}
          <Link className="ops-ladder-link" href="/customers">
            {copy.efficacy.goCustomers}
          </Link>
        </div>
      </section>

      <article className="chart-card">
        <h2 className="chart-title">{copy.dash.revenue}</h2>
        <p className="stat-hint">{copy.dash.trendUnit}</p>
        {months.length ? (
          <AreaLine
            grid
            pace="slow"
            points={months.map((m) => ({
              label: monthLabel(m.key),
              value: m.per_day_revenue,
            }))}
            {...(last
              ? {
                  marker: formatBillionsFigure(last.per_day_revenue),
                  caption: `${monthLabel(last.key)} · ${formatBillionsRial(last.per_day_revenue)}`,
                }
              : {})}
          />
        ) : (
          <p className="stat-hint">{copy.product.skeletonNote}</p>
        )}
      </article>

      <details className="ops-block">
        <summary className="ops-block-title cursor-pointer">{copy.efficacy.growthMarketTitle}</summary>
        <p className="ops-block-hint">{copy.efficacy.platformSection}</p>
        <AreaLine
          grid
          pace="slow"
          points={platform.jalali_months.map((m) => ({
            label: monthLabel(m.key),
            value: m.per_day_revenue,
          }))}
        />
        <ul className="case-grid mt-4">
          {platform.jalali_months.map((m) => (
            <li key={m.key} className="stat-card">
              <p className="stat-label">{monthLabel(m.key)}</p>
              <p className="stat-value">{formatBillionsRial(m.per_day_revenue)}</p>
              {m.days < 28 ? (
                <p className="stat-hint">{copy.insufficient.partial_month}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </details>
    </PageShell>
  );
}
