import { copy, formatBillionsRial, formatCount, count, formatRatioAsPercent } from '@zarinpulse/contracts';
import Link from 'next/link';
import { MiniRing } from '../../components/Charts';
import { GatewayFlipPlate } from '../../components/DepthMotifs';
import { PageShell } from '../../components/PageShell';
import { StatusPill } from '../../components/StatusPill';
import {
  readArtifact,
  readMerchantArtifact,
  type MerchantIndexRow,
} from '../../lib/artifacts';
import { healthAction } from '../../lib/health';
import { HOME_SAMPLE_MERCHANT_KEY } from '../../lib/merchant-periods';

export default function HealthPage() {
  const sample = readMerchantArtifact(HOME_SAMPLE_MERCHANT_KEY);
  const index = readArtifact<MerchantIndexRow[]>('merchants-index.json');
  const broken = index
    .filter((m) => m.health !== 'healthy')
    .slice()
    .sort((a, b) => b.recoverable_rial - a.recoverable_rial);
  const sampleHealthy = sample.health === 'healthy';

  return (
    <PageShell width="wide">
      <header className="dash-hero reveal">
        <p className="page-kicker">
          {copy.efficacy.sampleKicker} · {sample.key}
        </p>
        <p className="stat-label">{copy.nav.health}</p>
      </header>

      <section className="ops-block reveal">
        {sampleHealthy ? (
          <>
            <h2 className="ops-block-title">{copy.efficacy.healthOkTitle}</h2>
            <p className="ops-block-hint">{copy.efficacy.healthOkBody}</p>
            <StatusPill code={sample.health} />
            <div className="ops-footer-links">
              <Link className="ops-ladder-link" href="/abandonment">
                {copy.nav.abandonment}
              </Link>
              {' · '}
              <Link className="ops-ladder-link" href="/peers">
                {copy.nav.peers}
              </Link>
              {' · '}
              <Link className="ops-ladder-link" href={`/m/${sample.key}`}>
                {copy.efficacy.goDetail}
              </Link>
            </div>
          </>
        ) : (
          <>
            <StatusPill code={sample.health} />
            <p className="ops-block-hint">{healthAction(sample.health)}</p>
          </>
        )}
      </section>

      <section className="ops-block">
        <div className="stat-card-row items-end justify-between gap-4">
          <div>
            <h2 className="ops-block-title">{copy.efficacy.healthTriageTitle}</h2>
            <p className="ops-block-hint">{copy.efficacy.healthTriageHint}</p>
            <p className="stat-label mt-2">{copy.dash.unhealthy}</p>
            <p className="hero-value">{formatCount(count(broken.length))}</p>
          </div>
          <GatewayFlipPlate unhealthy />
        </div>
        <ul className="case-grid mt-4">
          {broken.map((m) => (
            <li key={m.key} className="chart-card health-card-depth">
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
      </section>
    </PageShell>
  );
}
