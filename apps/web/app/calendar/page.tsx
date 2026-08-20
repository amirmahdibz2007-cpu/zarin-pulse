import { copy, formatJalali, formatRatioAsPercent } from '@zarinpulse/contracts';
import { MiniRing } from '../../components/Charts';
import { PageHeader, PageShell } from '../../components/PageShell';
import { readArtifact, type PlatformArtifact } from '../../lib/artifacts';

export default function CalendarPage() {
  const platform = readArtifact<PlatformArtifact>('platform.json');
  const events = readArtifact<
    { id: string; titleFa: string; startIso: string; endIso: string; inDataWindow: boolean; noteFa: string }[]
  >('calendar-events.json');
  const spike = readArtifact<{ key: string; revenue_rial: number }[]>('spike-2026-06-23.json');
  const top = spike[0];
  const total = spike.reduce((a, r) => a + r.revenue_rial, 0);
  const share = top && total > 0 ? top.revenue_rial / total : 0;
  return (
    <PageShell width="wide">
      <PageHeader kicker={copy.product.name} title={copy.nav.calendar} />
      <p className="text-sm text-[color:var(--zp-muted)]">
        {copy.insufficient.low_coverage_period} ({String(platform.low_coverage_days)})
      </p>
      <p className="leading-7">{copy.nowruzNote}</p>
      {share >= 0.5 && top ? (
        <article className="chart-card stat-card-row note-warning">
          <div>
            <p className="stat-label">{copy.insufficient.single_entity_dominated}</p>
            <p className="stat-value">{top.key}</p>
            <p className="stat-hint">{formatRatioAsPercent(share)}</p>
          </div>
          <MiniRing ratio={share} ticks size="m" />
        </article>
      ) : null}
      <ul className="case-grid">
        {events.map((e) => (
          <li key={e.id} className="chart-card">
            <p className="chart-title">{e.titleFa}</p>
            <p className="stat-hint">{formatJalali(e.startIso)}</p>
            <p className="mt-2 text-sm leading-7 text-[color:var(--zp-muted)]">
              {e.inDataWindow ? e.noteFa : copy.outOfWindow}
            </p>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
