import { copy, count, formatCount } from '@zarinpulse/contracts';
import Link from 'next/link';
import { RowBar } from '../../components/Charts';
import { PageHeader, PageShell } from '../../components/PageShell';
import { readArtifact, type MerchantArtifact } from '../../lib/artifacts';

export default function PricesPage() {
  const m106 = readArtifact<MerchantArtifact>('merchants/M106.json');
  const m319 = readArtifact<MerchantArtifact>('merchants/M319.json');
  const rows = [
    { key: 'M106', href: '/m/M106', value: m106.unique_prices },
    { key: 'M319', href: '/m/M319', value: m319.unique_prices },
  ] as const;
  const max = Math.max(1, ...rows.map((r) => r.value ?? 0));
  return (
    <PageShell width="wide">
      <PageHeader kicker={copy.product.name} title={copy.nav.prices} lede={copy.fee.floorTrap} />
      <p className="leading-7 text-[color:var(--zp-muted)]">{copy.playbook.price_point}</p>
      <section className="chart-card space-y-4">
        <p className="stat-label">{copy.uniquePricesLabel}</p>
        <ul className="space-y-4">
          {rows.map((r) => (
            <li key={r.key} className="rate-row">
              <div className="rate-row-meta">
                <Link href={r.href} className="link-quiet font-medium">
                  {r.key}
                </Link>
                <span className="stat-hint">
                  {r.value !== undefined ? formatCount(count(r.value)) : '—'}
                </span>
              </div>
              <RowBar value={r.value ?? 0} max={max} />
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
