import {
  copy,
  count,
  formatBillionsRial,
  formatCount,
  formatJalali,
  formatRatioAsPercent,
  formatRial,
} from '@zarinpulse/contracts';
import Link from 'next/link';
import { MiniRing, RowBar } from '../../components/Charts';
import { PageHeader, PageShell } from '../../components/PageShell';
import {
  readArtifact,
  readMerchantArtifact,
  type PlatformArtifact,
} from '../../lib/artifacts';
import { HOME_SAMPLE_MERCHANT_KEY } from '../../lib/merchant-periods';

type CalEvent = {
  id: string;
  titleFa: string;
  startIso: string;
  endIso: string;
  inDataWindow: boolean;
  noteFa: string;
};

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
}

function occasionBand(
  daily: PlatformArtifact['daily'],
  startIso: string,
  endIso: string,
): { avg: number; median: number; lowDays: number; days: number } {
  const inRange = daily.filter((d) => d.day >= startIso && d.day <= endIso);
  const sessions = inRange.map((d) => d.sessions);
  const avg = sessions.length === 0 ? 0 : sessions.reduce((a, b) => a + b, 0) / sessions.length;
  const baseline = daily.filter((d) => !d.low).map((d) => d.sessions);
  return {
    avg,
    median: median(baseline),
    lowDays: inRange.filter((d) => d.low).length,
    days: inRange.length,
  };
}

export default function CalendarPage() {
  const sample = readMerchantArtifact(HOME_SAMPLE_MERCHANT_KEY);
  const platform = readArtifact<PlatformArtifact>('platform.json');
  const events = readArtifact<CalEvent[]>('calendar-events.json');
  const spike = readArtifact<{ key: string; revenue_rial: number }[]>('spike-2026-06-23.json');
  const top = spike[0];
  const spikeTotal = spike.reduce((a, r) => a + r.revenue_rial, 0);
  const share = top && spikeTotal > 0 ? top.revenue_rial / spikeTotal : 0;
  const ordered = [...events].sort((a, b) => a.startIso.localeCompare(b.startIso));
  const bahman = platform.jalali_months.find((m) => m.key === '1404-11');
  const farvardin = platform.jalali_months.find((m) => m.key === '1405-01');
  const inWindow = ordered.filter((e) => e.inDataWindow);
  const nextOccasion = inWindow[0];
  const peaks = sample.ops?.sales_peaks.top_days ?? [];
  const spikeMax = Math.max(1, ...spike.map((s) => s.revenue_rial));

  return (
    <PageShell width="wide">
      <PageHeader
        kicker={`${copy.efficacy.sampleKicker} · ${sample.key}`}
        title={copy.nav.calendar}
        lede={copy.efficacy.calendarDiagnosis}
      />

      <section className="ops-block reveal">
        <h2 className="ops-block-title">{copy.efficacy.calendarNext}</h2>
        {nextOccasion ? (
          <p className="stat-value text-xl">
            {nextOccasion.titleFa}
            <span className="stat-hint mr-2 text-base font-normal">
              · {formatJalali(nextOccasion.startIso)}
            </span>
          </p>
        ) : (
          <p className="ops-block-hint">{copy.outOfWindow}</p>
        )}
        <p className="ops-block-hint">
          <span className="font-medium">{copy.efficacy.nextStep}: </span>
          {copy.efficacy.calendarAction}
        </p>
        <ul className="mt-3 space-y-2 text-sm leading-7 text-[color:var(--zp-ink)]">
          <li>— {copy.efficacy.calendarChecklistSupport}</li>
          <li>— {copy.efficacy.calendarChecklistStock}</li>
          <li>— {copy.efficacy.calendarChecklistMsg}</li>
        </ul>
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
          <Link className="ops-ladder-link" href="/growth">
            {copy.nav.growth}
          </Link>
        </div>
      </section>

      <p className="text-sm text-[color:var(--zp-muted)]">
        {copy.efficacy.platformSection}
        {' · '}
        {copy.insufficient.low_coverage_period} ({String(platform.low_coverage_days)})
      </p>
      <p className="leading-7">{copy.nowruzNote}</p>

      {bahman && farvardin ? (
        <section className="chart-card space-y-4">
          <p className="chart-title">{copy.calendarInsight.nowruzTitle}</p>
          <ul className="dash-kpis">
            <li className="stat-card">
              <p className="stat-label">
                {copy.calendarInsight.bahman} · {copy.calendarInsight.aov}
              </p>
              <p className="stat-value">{formatRial(Math.round(bahman.aov))}</p>
              <p className="stat-hint">
                {copy.calendarInsight.ordersPerDay}{' '}
                {formatCount(count(Math.round(bahman.per_day_orders)))}
              </p>
            </li>
            <li className="stat-card">
              <p className="stat-label">
                {copy.calendarInsight.farvardin} · {copy.calendarInsight.aov}
              </p>
              <p className="stat-value">{formatRial(Math.round(farvardin.aov))}</p>
              <p className="stat-hint">
                {copy.calendarInsight.ordersPerDay}{' '}
                {formatCount(count(Math.round(farvardin.per_day_orders)))}
              </p>
            </li>
          </ul>
          <p className="stat-hint">
            {copy.calendarInsight.farvardin}: {formatRatioAsPercent(farvardin.aov / bahman.aov)}{' '}
            {copy.calendarInsight.aov} ({copy.calendarInsight.bahman})
          </p>
        </section>
      ) : null}

      {top && share >= 0.25 ? (
        <section className="chart-card space-y-4">
          <div className="stat-card-row note-warning rounded-[1.1rem] border border-[color:var(--zp-border)] p-4">
            <div>
              <p className="stat-label">{copy.calendarInsight.spikeTitle}</p>
              <p className="stat-value">
                <Link href={`/m/${top.key}`} className="link-quiet">
                  {top.key}
                </Link>
              </p>
              <p className="stat-hint">
                {copy.calendarInsight.topShare} · {formatRatioAsPercent(share)}
              </p>
              <p className="stat-hint">{copy.calendarInsight.spikeNearSummer}</p>
            </div>
            <MiniRing ratio={share} ticks size="m" />
          </div>
          <ul className="space-y-3">
            {spike.slice(0, 5).map((s) => (
              <li key={s.key} className="rate-row">
                <div className="rate-row-meta">
                  <Link href={`/m/${s.key}`} className="link-quiet font-medium">
                    {s.key}
                  </Link>
                  <span className="stat-hint">{formatBillionsRial(s.revenue_rial)}</span>
                </div>
                <RowBar value={s.revenue_rial} max={spikeMax} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="chart-card space-y-4">
        <p className="chart-title">{copy.calendarInsight.occasionBand}</p>
        <ul className="space-y-3">
          {inWindow.map((e) => {
            const band = occasionBand(platform.daily, e.startIso, e.endIso);
            const vs = band.median > 0 ? band.avg / band.median : 0;
            return (
              <li key={e.id} className="rate-row rounded-[1rem] border border-[color:var(--zp-border)] p-3">
                <div className="rate-row-meta">
                  <span className="font-medium">{e.titleFa}</span>
                  <span className="stat-hint">{formatJalali(e.startIso)}</span>
                </div>
                <p className="stat-hint">
                  {copy.calendarInsight.avgSessions} {formatCount(count(Math.round(band.avg)))}
                  {band.median > 0 ? (
                    <>
                      {' '}
                      · {copy.calendarInsight.vsMedian} {formatRatioAsPercent(vs)}
                    </>
                  ) : null}
                  {band.lowDays > 0 ? (
                    <>
                      {' '}
                      · {copy.calendarInsight.lowInRange} {formatCount(count(band.lowDays))}
                    </>
                  ) : null}
                </p>
                <RowBar value={band.avg} max={Math.max(band.avg, band.median, 1)} />
              </li>
            );
          })}
        </ul>
      </section>

      <section className="chart-card space-y-3">
        <ol className="event-timeline" aria-label={copy.nav.calendar}>
          {ordered.map((e) => (
            <li key={e.id} data-in={e.inDataWindow ? '1' : '0'}>
              <span className="event-timeline-dot" />
              <span className="event-timeline-date">{formatJalali(e.startIso)}</span>
              <span className="event-timeline-title">{e.titleFa}</span>
              <span className="event-timeline-tag">
                {e.inDataWindow ? copy.rangeTag.inWindow : copy.rangeTag.outWindow}
              </span>
              <p className="event-timeline-note">{e.inDataWindow ? e.noteFa : copy.outOfWindow}</p>
            </li>
          ))}
        </ol>
      </section>
    </PageShell>
  );
}
