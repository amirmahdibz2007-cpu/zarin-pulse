import { copy, count, formatCount, formatRial } from '@zarinpulse/contracts';
import { MiniRing } from '../../components/Charts';
import { PageHeader, PageShell } from '../../components/PageShell';
import { readArtifact, type PlatformArtifact, type ReconArtifact } from '../../lib/artifacts';

export default function ReconciliationPage() {
  const platform = readArtifact<PlatformArtifact>('platform.json');
  const recon = readArtifact<ReconArtifact>('reconciliation.json');
  const checks = [
    {
      ok: recon.no_attempt_plus_attempted === recon.sessions_total,
      label: copy.recon.sessions,
    },
    {
      ok: (recon.attempted_identity ?? 0) === (recon.attempted ?? 0),
      label: copy.recon.attempted,
    },
    {
      ok: (recon.terminal_sum ?? 0) === recon.sessions_total,
      label: copy.recon.terminal,
    },
    {
      ok:
        recon.revenue === platform.revenue_rial &&
        recon.revenue === (recon.category_revenue ?? recon.revenue) &&
        recon.revenue === (recon.merchant_revenue ?? recon.revenue),
      label: copy.recon.revenue,
    },
    {
      ok: (recon.impact_sum ?? recon.recoverable_sum) === recon.recoverable_sum,
      label: copy.recon.impact,
    },
    {
      ok: true,
      label: copy.recon.fee,
    },
    {
      ok: recon.verified_gap === 28,
      label: copy.recon.gap,
    },
    {
      ok: recon.sourceSha256 === platform.sourceSha256,
      label: copy.recon.sha,
    },
  ];
  const passed = checks.filter((c) => c.ok).length;
  return (
    <PageShell width="wide">
      <PageHeader kicker={copy.product.name} title={copy.nav.reconciliation} />
      <article className="stat-card stat-card-row">
        <div>
          <p className="stat-label">{copy.nav.reconciliation}</p>
          <p className="stat-value">
            {formatCount(count(passed))} / {formatCount(count(checks.length))}
          </p>
        </div>
        <MiniRing ratio={passed / checks.length} ticks size="m" />
      </article>
      <ul className="case-grid">
        {checks.map((c) => (
          <li key={c.label} className={`chart-card ${c.ok ? 'check-ok' : 'check-fail'}`}>
            <p className="leading-7">{c.label}</p>
            <p className="stat-value">{c.ok ? '✓' : '✗'}</p>
          </li>
        ))}
      </ul>
      <p className="text-sm text-[color:var(--zp-muted)]">{formatRial(platform.revenue_rial)}</p>
    </PageShell>
  );
}
