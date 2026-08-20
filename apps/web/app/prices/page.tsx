import { copy } from '@zarinpulse/contracts';
import Link from 'next/link';
import { PageHeader, PageShell } from '../../components/PageShell';
import { readArtifact, type MerchantArtifact } from '../../lib/artifacts';

export default function PricesPage() {
  const m106 = readArtifact<MerchantArtifact>('merchants/M106.json');
  const m319 = readArtifact<MerchantArtifact>('merchants/M319.json');
  return (
    <PageShell width="wide">
      <PageHeader kicker={copy.product.name} title={copy.nav.prices} lede={copy.fee.floorTrap} />
      <p className="leading-7 text-[color:var(--zp-muted)]">{copy.playbook.price_point}</p>
      <section className="dash-kpis">
        <article className="stat-card">
          <Link href="/m/M106" className="link-quiet font-medium">
            M106
          </Link>
          <p className="stat-value">{m106.unique_prices !== undefined ? String(m106.unique_prices) : '—'}</p>
        </article>
        <article className="stat-card">
          <Link href="/m/M319" className="link-quiet font-medium">
            M319
          </Link>
          <p className="stat-value">{m319.unique_prices !== undefined ? String(m319.unique_prices) : '—'}</p>
        </article>
      </section>
    </PageShell>
  );
}
