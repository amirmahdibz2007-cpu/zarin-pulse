import {
  copy,
  formatBillionsRial,
  formatRatioAsPercent,
} from '@zarinpulse/contracts';
import Link from 'next/link';
import { MiniRing, RowBar } from '../../components/Charts';
import { PageHeader, PageShell } from '../../components/PageShell';
import {
  readArtifact,
  readMerchantArtifact,
  type MerchantIndexRow,
} from '../../lib/artifacts';
import { HOME_SAMPLE_MERCHANT_KEY } from '../../lib/merchant-periods';

export default function PeersPage() {
  const sample = readMerchantArtifact(HOME_SAMPLE_MERCHANT_KEY);
  const index = readArtifact<MerchantIndexRow[]>('merchants-index.json');
  const peers = sample.peers;
  const gap = peers && peers.gap > 0 ? peers.gap : 0;
  const p75 = peers?.p75 ?? 0;
  const you = sample.success_rate;

  const categoryPeers = index
    .filter((m) => m.category === sample.category && m.key !== sample.key && m.sessions >= 100)
    .sort((a, b) => b.success_rate - a.success_rate)
    .slice(0, 12);

  const league = [...index].sort((a, b) => b.recoverable_rial - a.recoverable_rial).slice(0, 12);
  const recMax = Math.max(1, ...league.map((m) => m.recoverable_rial));

  return (
    <PageShell width="wide">
      <PageHeader
        kicker={`${copy.efficacy.sampleKicker} · ${sample.key}`}
        title={copy.nav.peers}
        lede={copy.efficacy.peersDiagnosis.replace('{gap}', formatRatioAsPercent(gap))}
      />

      <section className="ops-block reveal">
        <div className="dash-kpis">
          <article className="stat-card">
            <p className="stat-label">{copy.efficacy.peersYou}</p>
            <p className="stat-value">{formatRatioAsPercent(you)}</p>
          </article>
          <article className="stat-card">
            <p className="stat-label">{copy.efficacy.peersP75}</p>
            <p className="stat-value">{formatRatioAsPercent(p75)}</p>
          </article>
          <article className="stat-card">
            <p className="stat-label">{copy.efficacy.peersGap}</p>
            <p className="stat-value">{formatRatioAsPercent(gap)}</p>
          </article>
          <article className="stat-card">
            <p className="stat-label">{copy.currency.recoverable_sales}</p>
            <p className="stat-value">
              {sample.impact ? formatBillionsRial(sample.impact.expected) : '—'}
            </p>
          </article>
        </div>
        <p className="ops-block-hint">
          <span className="font-medium">{copy.efficacy.nextStep}: </span>
          {copy.efficacy.peersAction}
        </p>
        <div className="ops-footer-links">
          <Link className="ops-ladder-link" href="/customers">
            {copy.efficacy.goCustomers}
          </Link>
          {' · '}
          <a className="ops-ladder-link" href="/api/download/export?merchant=M31&kind=inbank">
            {copy.ops.downloadInbank}
          </a>
          {' · '}
          <Link className="ops-ladder-link" href={`/m/${sample.key}`}>
            {copy.efficacy.goDetail}
          </Link>
        </div>
      </section>

      <section className="ops-block">
        <h2 className="ops-block-title">{copy.efficacy.peersPool}</h2>
        <p className="ops-block-hint">{sample.category}</p>
        <ul className="divide-y divide-[color:var(--zp-border)]">
          {categoryPeers.map((m) => (
            <li key={m.key} className="flex items-center justify-between gap-3 py-3">
              <Link href={`/m/${m.key}`} className="link-quiet font-medium">
                {m.key}
              </Link>
              <span className="inline-flex items-center gap-2">
                <MiniRing ratio={m.success_rate} />
                {formatRatioAsPercent(m.success_rate)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="ops-block">
        <h2 className="ops-block-title">{copy.efficacy.peersLeagueTitle}</h2>
        <p className="ops-block-hint">{copy.efficacy.peersLeagueHint}</p>
        <div className="table-recess surface-table mt-3 overflow-hidden">
          <table className="hidden w-full text-sm lg:table">
            <thead>
              <tr className="text-right">
                <th className="p-3 font-medium text-[color:var(--zp-muted)]">{copy.dash.merchant}</th>
                <th className="p-3 font-medium text-[color:var(--zp-muted)]">{copy.terminal.Verified}</th>
                <th className="p-3 font-medium text-[color:var(--zp-muted)]">
                  {copy.currency.recoverable_sales}
                </th>
              </tr>
            </thead>
            <tbody>
              {league.map((m) => (
                <tr key={m.key} className="border-t border-[color:var(--zp-border)]">
                  <td className="p-3">
                    <Link href={`/m/${m.key}`} className="link-quiet font-medium">
                      {m.key}
                    </Link>
                  </td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-2">
                      <MiniRing ratio={m.success_rate} />
                      {formatRatioAsPercent(m.success_rate)}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="row-metric">
                      {formatBillionsRial(m.recoverable_rial)}
                      <RowBar value={m.recoverable_rial} max={recMax} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <ul className="divide-y divide-[color:var(--zp-border)] lg:hidden">
            {league.map((m) => (
              <li key={m.key} className="p-4">
                <Link href={`/m/${m.key}`} className="link-quiet font-medium">
                  {m.key}
                </Link>
                <div className="stat-card-row mt-2">
                  <span className="row-metric">
                    {formatBillionsRial(m.recoverable_rial)}
                    <RowBar value={m.recoverable_rial} max={recMax} />
                  </span>
                  <MiniRing ratio={m.success_rate} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </PageShell>
  );
}
