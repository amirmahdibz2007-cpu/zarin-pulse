import { copy, count, formatCount, formatRatioAsPercent } from '@zarinpulse/contracts';
import { RowBar } from '../../components/Charts';
import { PageHeader, PageShell } from '../../components/PageShell';
import { readArtifact } from '../../lib/artifacts';

export default function PspPage() {
  const rows = readArtifact<{ psp: string; n: number; won: number; rate: number }[]>('psp.json');
  const cross = readArtifact<{ category: string; psp: string; n: number; won: number; rate: number }[]>(
    'psp-category.json',
  );
  const simpson = cross.filter((r) => r.psp === 'PSP-05' && r.n >= 1000);
  const nMax = Math.max(1, ...rows.map((r) => r.n));
  const sorted = [...rows].sort((a, b) => b.rate - a.rate);
  return (
    <PageShell width="wide">
      <PageHeader kicker={copy.product.name} title={copy.nav.psp} lede={copy.simpsonNote} />
      <section className="chart-card space-y-4">
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
                  <span className="rate-fill" style={{ width: `${String(Math.round(r.rate * 100))}%` }} />
                </div>
                <RowBar value={r.n} max={nMax} />
              </div>
            </li>
          ))}
        </ul>
      </section>
      <div className="table-recess surface-table hidden overflow-hidden lg:block">
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
      <ul className="divide-y divide-[color:var(--zp-border)] rounded-[1.25rem] border border-[color:var(--zp-border)] lg:hidden">
        {simpson.map((r) => (
          <li key={`${r.category}-${r.psp}`} className="flex items-baseline justify-between gap-3 p-3">
            <span className="min-w-0 text-sm leading-6">{r.category}</span>
            <span className="shrink-0 text-sm font-medium">{formatRatioAsPercent(r.rate)}</span>
          </li>
        ))}
      </ul>
      <p className="text-sm leading-7 text-[color:var(--zp-muted)]">{copy.simulatorNote}</p>
    </PageShell>
  );
}
