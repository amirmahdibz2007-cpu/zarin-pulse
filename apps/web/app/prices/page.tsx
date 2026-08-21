import { copy, count, formatCount, formatRatioAsPercent } from '@zarinpulse/contracts';
import Link from 'next/link';
import { RowBar } from '../../components/Charts';
import { PageHeader, PageShell } from '../../components/PageShell';
import { readMerchantArtifact } from '../../lib/artifacts';
import { HOME_SAMPLE_MERCHANT_KEY } from '../../lib/merchant-periods';

function bandLabel(id: string): string {
  if (id === '0_5_2m') return copy.ops.bandCheap;
  if (id === '2_5m') return copy.ops.bandDear;
  return id;
}

export default function PricesPage() {
  const sample = readMerchantArtifact(HOME_SAMPLE_MERCHANT_KEY);
  const m106 = readMerchantArtifact('M106');
  const m319 = readMerchantArtifact('M319');
  const cheap = sample.ops?.amount_bands.find((b) => b.id === '0_5_2m');
  const dear = sample.ops?.amount_bands.find((b) => b.id === '2_5m');
  const floorRows = [
    { key: 'M106', href: '/m/M106', value: m106.unique_prices },
    { key: 'M319', href: '/m/M319', value: m319.unique_prices },
  ] as const;
  const max = Math.max(1, ...floorRows.map((r) => r.value ?? 0));

  return (
    <PageShell width="wide">
      <PageHeader
        kicker={`${copy.efficacy.sampleKicker} · ${sample.key}`}
        title={copy.nav.prices}
        lede={copy.efficacy.pricesDiagnosis}
      />

      <section className="ops-block reveal">
        <p className="ops-block-hint">
          <span className="font-medium">{copy.efficacy.nextStep}: </span>
          {copy.efficacy.pricesAction}
        </p>
        <div className="ops-band-compare mt-4">
          {[cheap, dear].filter(Boolean).map((b) => (
            <article key={b!.id} className="ops-band-card">
              <p className="ops-band-label">{bandLabel(b!.id)}</p>
              <p className="ops-band-rate">{formatRatioAsPercent(b!.success_rate)}</p>
              <p className="ops-band-meta">
                {copy.ops.successRate}
                {' · '}
                {formatCount(count(b!.sessions))} {copy.dash.sessions}
              </p>
            </article>
          ))}
        </div>
        <p className="ops-band-action">{copy.ops.bandAction}</p>
        <div className="ops-footer-links">
          <Link className="ops-ladder-link" href="/customers">
            {copy.efficacy.goCustomers}
          </Link>
          {' · '}
          <Link className="ops-ladder-link" href="/fees">
            {copy.nav.fees}
          </Link>
        </div>
      </section>

      <section className="ops-block">
        <h2 className="ops-block-title">{copy.efficacy.pricesFloorCases}</h2>
        <p className="ops-block-hint">{copy.fee.floorTrap}</p>
        <p className="leading-7 text-[color:var(--zp-muted)]">{copy.playbook.price_point}</p>
        <div className="chart-card mt-3 space-y-4">
          <p className="stat-label">{copy.uniquePricesLabel}</p>
          <ul className="space-y-4">
            {floorRows.map((r) => (
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
        </div>
      </section>
    </PageShell>
  );
}
