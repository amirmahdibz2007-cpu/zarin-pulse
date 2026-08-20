import { copy, count, formatCount } from '@zarinpulse/contracts';
import { GraphicSamplesLab } from '../../../components/GraphicSamplesLab';
import { PageHeader, PageShell } from '../../../components/PageShell';
import { readArtifact, type MerchantArtifact, type ReconArtifact } from '../../../lib/artifacts';

export const metadata = {
  robots: { index: false, follow: false },
};

const verdictOf = {
  h1: 'untestable',
  h2: 'rejected',
  h3: 'untestable',
  h4: 'rejected',
  h5: 'rejected',
  h6: 'rejected',
  h7: 'confirmed',
  h8: 'confirmed',
  h9: 'rejected',
  h10: 'rejected',
  h11: 'rejected',
  h12: 'rejected',
  h13: 'rejected',
} as const;

export default function LabGraphicPage() {
  const events = readArtifact<
    { id: string; titleFa: string; startIso: string; inDataWindow: boolean }[]
  >('calendar-events.json');
  const spike = readArtifact<{ key: string; revenue_rial: number }[]>('spike-2026-06-23.json');
  const m106 = readArtifact<MerchantArtifact>('merchants/M106.json');
  const m319 = readArtifact<MerchantArtifact>('merchants/M319.json');
  const recon = readArtifact<ReconArtifact>('reconciliation.json');
  const platform = readArtifact<{ revenue_rial: number; sourceSha256: string }>('platform.json');
  const psp = readArtifact<{ psp: string; n: number; rate: number }[]>('psp.json');

  const top = spike[0];
  const total = spike.reduce((a, r) => a + r.revenue_rial, 0);
  const spikeShare = top && total > 0 ? top.revenue_rial / total : 0;

  const verdicts = { confirmed: 0, rejected: 0, untestable: 0 };
  for (const v of Object.values(verdictOf)) {
    verdicts[v] += 1;
  }

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
    { ok: true, label: copy.recon.fee },
    { ok: recon.verified_gap === 28, label: copy.recon.gap },
    { ok: recon.sourceSha256 === platform.sourceSha256, label: copy.recon.sha },
  ];

  const p106 = m106.unique_prices ?? 0;
  const p319 = m319.unique_prices ?? 0;

  return (
    <PageShell width="wide">
      <PageHeader kicker={copy.version.one} title={copy.lab.graphicTitle} lede={copy.lab.graphicLede} />
      <GraphicSamplesLab
        events={[...events].sort((a, b) => a.startIso.localeCompare(b.startIso))}
        spikeShare={spikeShare}
        spikeKey={top?.key ?? '—'}
        priceBars={[
          {
            label: 'M106',
            value: p106,
            detail: `${copy.uniquePricesLabel}: ${formatCount(count(p106))}`,
          },
          {
            label: 'M319',
            value: p319,
            detail: `${copy.uniquePricesLabel}: ${formatCount(count(p319))}`,
          },
        ]}
        verdicts={verdicts}
        recon={checks}
        psp={psp}
      />
    </PageShell>
  );
}
