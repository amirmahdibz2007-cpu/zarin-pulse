import { copy, formatBillionsRial, formatCount, count, formatRatioAsPercent } from '@zarinpulse/contracts';
import Link from 'next/link';
import { MiniRing } from '../../components/Charts';
import { PageShell } from '../../components/PageShell';
import { StatusPill } from '../../components/StatusPill';
import { readArtifact, type MerchantIndexRow } from '../../lib/artifacts';
import { healthAction } from '../../lib/health';

export default function HealthPage() {
  const index = readArtifact<MerchantIndexRow[]>('merchants-index.json');
  const broken = index
    .filter((m) => m.health !== 'healthy')
    .slice()
    .sort((a, b) => b.recoverable_rial - a.recoverable_rial);
  return (
    <PageShell width="wide">
      <header className="dash-hero reveal">
        <p className="page-kicker">{copy.nav.health}</p>
        <p className="stat-label">{copy.dash.unhealthy}</p>
        <p className="hero-value">{formatCount(count(broken.length))}</p>
      </header>
      <ul className="case-grid">
        {broken.map((m) => (
          <li key={m.key} className="chart-card">
            <div className="stat-card-row">
              <div>
                <Link href={`/m/${m.key}`} className="link-quiet block min-h-11 font-medium">
                  {m.key}
                </Link>
                <StatusPill code={m.health} />
                <p className="mt-2 text-sm text-[color:var(--zp-muted)]">{healthAction(m.health)}</p>
                <p className="stat-hint">{formatBillionsRial(m.recoverable_rial)}</p>
              </div>
              <MiniRing ratio={m.success_rate} ticks size="m" />
            </div>
            <p className="stat-hint">{formatRatioAsPercent(m.success_rate)}</p>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
