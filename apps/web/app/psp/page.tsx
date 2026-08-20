import { copy, formatRatioAsPercent } from '@zarinpulse/contracts';
import { MiniRing, RowBar } from '../../components/Charts';
import { PageHeader, PageShell } from '../../components/PageShell';
import { readArtifact } from '../../lib/artifacts';

export default function PspPage() {
  const rows = readArtifact<{ psp: string; n: number; won: number; rate: number }[]>('psp.json');
  const cross = readArtifact<{ category: string; psp: string; n: number; won: number; rate: number }[]>(
    'psp-category.json',
  );
  const simpson = cross.filter((r) => r.psp === 'PSP-05' && r.n >= 1000);
  const nMax = Math.max(1, ...rows.map((r) => r.n));
  return (
    <PageShell width="wide">
      <PageHeader kicker={copy.product.name} title={copy.nav.psp} lede={copy.simpsonNote} />
      <ul className="case-grid">
        {rows.map((r) => (
          <li key={r.psp} className="chart-card stat-card-row">
            <div>
              <p className="stat-label">{r.psp}</p>
              <p className="stat-value">{formatRatioAsPercent(r.rate)}</p>
              <RowBar value={r.n} max={nMax} />
            </div>
            <MiniRing ratio={r.rate} ticks size="m" />
          </li>
        ))}
      </ul>
      <div className="table-recess surface-table overflow-hidden">
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
      <p className="text-sm leading-7 text-[color:var(--zp-muted)]">{copy.simulatorNote}</p>
    </PageShell>
  );
}
