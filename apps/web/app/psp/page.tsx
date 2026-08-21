import { copy, count, formatCount, formatRatioAsPercent } from '@zarinpulse/contracts';
import Link from 'next/link';
import { RowBar } from '../../components/Charts';
import { PageHeader, PageShell } from '../../components/PageShell';
import { readArtifact, readMerchantArtifact } from '../../lib/artifacts';
import { HOME_SAMPLE_MERCHANT_KEY } from '../../lib/merchant-periods';

export default function PspPage() {
  const sample = readMerchantArtifact(HOME_SAMPLE_MERCHANT_KEY);
  const rows = readArtifact<{ psp: string; n: number; won: number; rate: number }[]>('psp.json');
  const cross = readArtifact<{ category: string; psp: string; n: number; won: number; rate: number }[]>(
    'psp-category.json',
  );
  const simpson = cross.filter((r) => r.psp === 'PSP-05' && r.n >= 1000);
  const nMax = Math.max(1, ...rows.map((r) => r.n));
  const sorted = [...rows].sort((a, b) => b.rate - a.rate);
  const mix = [...(sample.ops?.psp_mix ?? [])].filter((r) => r.psp !== '(empty)');
  const mixMax = Math.max(1, ...mix.map((r) => r.sessions));

  return (
    <PageShell width="wide">
      <PageHeader
        kicker={`${copy.efficacy.sampleKicker} · ${sample.key}`}
        title={copy.nav.psp}
        lede={copy.efficacy.pspDiagnosis}
      />

      <section className="ops-block reveal">
        <h2 className="ops-block-title">{copy.efficacy.pspYourMix}</h2>
        <p className="ops-block-hint">
          <span className="font-medium">{copy.efficacy.nextStep}: </span>
          {copy.efficacy.pspAction}
        </p>
        <ul className="mt-4 space-y-3">
          {mix.map((r) => (
            <li key={r.psp} className="rate-row">
              <div className="rate-row-meta">
                <span className="font-medium">{r.psp}</span>
                <span className="stat-hint">
                  {formatRatioAsPercent(r.success_rate)} · n={formatCount(count(r.sessions))}
                </span>
              </div>
              <div className="rate-row-bars">
                <div className="rate-track" aria-hidden="true">
                  <span
                    className="rate-fill"
                    style={{ width: `${String(Math.round(r.success_rate * 100))}%` }}
                  />
                </div>
                <RowBar value={r.sessions} max={mixMax} />
              </div>
            </li>
          ))}
        </ul>
        <div className="ops-footer-links">
          <Link className="ops-ladder-link" href="/abandonment">
            {copy.nav.abandonment}
          </Link>
          {' · '}
          <Link className="ops-ladder-link" href="/peers">
            {copy.nav.peers}
          </Link>
        </div>
      </section>

      <section className="ops-block">
        <h2 className="ops-block-title">{copy.efficacy.pspPlatformTitle}</h2>
        <p className="ops-block-hint">{copy.simpsonNote}</p>
        <div className="chart-card mt-3 space-y-4">
          <ul className="space-y-3">
            {sorted.map((r) => (
              <li key={r.psp} className="rate-row">
                <div className="rate-row-meta">
                  <span className="font-medium">{r.psp}</span>
                  <span className="stat-hint">
                    {formatRatioAsPercent(r.rate)} · n={formatCount(count(r.n))}
                  </span>
                </div>
                <div className="rate-row-bars">
                  <div className="rate-track" aria-hidden="true">
                    <span
                      className="rate-fill"
                      style={{ width: `${String(Math.round(r.rate * 100))}%` }}
                    />
                  </div>
                  <RowBar value={r.n} max={nMax} />
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="table-recess surface-table mt-4 hidden overflow-hidden lg:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right">
                <th className="p-3 font-medium text-[color:var(--zp-muted)]">{copy.nav.peers}</th>
                <th className="p-3 font-medium text-[color:var(--zp-muted)]">{copy.terminal.Verified}</th>
              </tr>
            </thead>
            <tbody>
              {simpson.map((r) => (
                <tr key={`${r.category}-${r.psp}`} className="border-t border-[color:var(--zp-border)]">
                  <td className="p-3">{r.category}</td>
                  <td className="p-3">{formatRatioAsPercent(r.rate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="mt-3 divide-y divide-[color:var(--zp-border)] rounded-[1.25rem] border border-[color:var(--zp-border)] lg:hidden">
          {simpson.map((r) => (
            <li key={`${r.category}-${r.psp}`} className="flex items-baseline justify-between gap-3 p-3">
              <span className="min-w-0 text-sm leading-6">{r.category}</span>
              <span className="shrink-0 text-sm font-medium">{formatRatioAsPercent(r.rate)}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm leading-7 text-[color:var(--zp-muted)]">{copy.simulatorNote}</p>
      </section>
    </PageShell>
  );
}
