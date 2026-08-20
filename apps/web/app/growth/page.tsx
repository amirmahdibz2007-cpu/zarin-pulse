import { copy, formatBillionsRial, MONTHS_FA } from '@zarinpulse/contracts';
import { AreaLine } from '../../components/Charts';
import { PageHeader, PageShell } from '../../components/PageShell';
import { readArtifact, type PlatformArtifact } from '../../lib/artifacts';

function monthLabel(key: string): string {
  const part = key.split('-')[1];
  const idx = Number(part) - 1;
  return MONTHS_FA[idx] ?? key;
}

export default function GrowthPage() {
  const platform = readArtifact<PlatformArtifact>('platform.json');
  const last = platform.jalali_months.at(-1);
  return (
    <PageShell width="wide">
      <PageHeader kicker={copy.product.name} title={copy.nav.growth} />
      <article className="chart-card">
        <h2 className="chart-title">{copy.dash.revenue}</h2>
        <AreaLine
          grid
          points={platform.jalali_months.map((m) => ({
            label: monthLabel(m.key),
            value: m.per_day_revenue,
          }))}
          marker={last ? formatBillionsRial(last.per_day_revenue) : undefined}
        />
      </article>
      <ul className="case-grid">
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
    </PageShell>
  );
}
