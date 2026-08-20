import { copy, formatBillionsRial, formatRatioAsPercent } from '@zarinpulse/contracts';
import Link from 'next/link';
import { MiniRing, RowBar } from '../../components/Charts';
import { PageHeader, PageShell } from '../../components/PageShell';
import { readArtifact, type MerchantIndexRow } from '../../lib/artifacts';

export default function PeersPage() {
  const index = readArtifact<MerchantIndexRow[]>('merchants-index.json');
  const top = [...index].sort((a, b) => b.recoverable_rial - a.recoverable_rial).slice(0, 20);
  const recMax = Math.max(1, ...top.map((m) => m.recoverable_rial));
  return (
    <PageShell width="wide">
      <PageHeader kicker={copy.product.name} title={copy.nav.peers} />
      <div className="table-recess surface-table overflow-hidden">
        <table className="hidden w-full text-sm lg:table">
          <thead>
            <tr className="text-right">
              <th className="p-3 font-medium text-[color:var(--zp-muted)]">{copy.dash.merchant}</th>
              <th className="p-3 font-medium text-[color:var(--zp-muted)]">{copy.terminal.Verified}</th>
              <th className="p-3 font-medium text-[color:var(--zp-muted)]">{copy.currency.recoverable_sales}</th>
            </tr>
          </thead>
          <tbody>
            {top.map((m) => (
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
          {top.map((m) => (
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
    </PageShell>
  );
}
