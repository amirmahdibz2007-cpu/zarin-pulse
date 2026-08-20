import { copy, formatRatioAsPercent } from '@zarinpulse/contracts';
import { Columns } from '../../components/Charts';
import { FeeCalculator } from '../../components/FeeCalculator';
import { PageHeader, PageShell } from '../../components/PageShell';
import { readArtifact } from '../../lib/artifacts';

export default function FeesPage() {
  const fees = readArtifact<
    { key: string; actual: number | null; expected: number | null; tariff_effect: number | null; potential: number }[]
  >('fees.json');
  const m106 = fees.find((f) => f.key === 'M106');
  const bars = fees
    .filter((f) => f.actual !== null)
    .sort((a, b) => (b.actual ?? 0) - (a.actual ?? 0))
    .slice(0, 7)
    .map((f) => ({
      label: f.key,
      value: f.actual ?? 0,
      detail: formatRatioAsPercent(f.actual ?? 0),
    }));
  return (
    <PageShell width="wide">
      <PageHeader kicker={copy.product.name} title={copy.nav.fees} />
      <p className="note-warning surface-panel text-sm leading-7">{copy.feeDisclaimer}</p>
      <section className="dash-kpis">
        <article className="stat-card">
          <p className="stat-label">{copy.fee.realized}</p>
          <p className="stat-value">
            {m106?.actual !== null && m106?.actual !== undefined ? formatRatioAsPercent(m106.actual) : '—'}
          </p>
        </article>
        <article className="stat-card">
          <p className="stat-label">{copy.fee.basketVsTariff}</p>
          <p className="stat-value">
            {m106?.expected !== null && m106?.expected !== undefined ? formatRatioAsPercent(m106.expected) : '—'}
          </p>
        </article>
      </section>
      <p className="leading-7 text-[color:var(--zp-muted)]">{copy.fee.floorTrap}</p>
      <section className="dash-pair">
        <article className="chart-card">
          <h2 className="chart-title">{copy.dash.merchant}</h2>
          <Columns bars={bars} variant="depth" />
        </article>
        <article className="chart-card">
          <FeeCalculator defaultBasket={100_000} />
        </article>
      </section>
      <p className="leading-7 text-[color:var(--zp-muted)]">{copy.fee.potential}</p>
      <p className="leading-7 text-[color:var(--zp-muted)]">{copy.playbook.fee_floor}</p>
    </PageShell>
  );
}
