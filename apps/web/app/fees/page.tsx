import {
  copy,
  count,
  formatBillionsRial,
  formatCount,
  formatRatioAsPercent,
  formatRial,
} from '@zarinpulse/contracts';
import Link from 'next/link';
import { FeeCalculator } from '../../components/FeeCalculator';
import { PageHeader, PageShell } from '../../components/PageShell';
import { readArtifact, type MerchantArtifact } from '../../lib/artifacts';
import { HOME_SAMPLE_MERCHANT_KEY } from '../../lib/merchant-periods';

export default function FeesPage() {
  const m = readArtifact<MerchantArtifact>(`merchants/${HOME_SAMPLE_MERCHANT_KEY}.json`);
  const actual = m.fee_actual;
  const expected = m.fee_expected;
  const tariff = m.tariff_effect;
  const better = tariff !== null && tariff < 0;
  const defaultBasket = Math.max(10_000, Math.round(m.median_amount || m.aov || 100_000));

  return (
    <PageShell width="wide">
      <PageHeader
        kicker={`${copy.homeMerchant.sampleBadge} · ${m.key}`}
        title={copy.nav.fees}
        lede={m.category}
      />
      <p className="note-warning surface-panel text-sm leading-7">{copy.feeDisclaimer}</p>

      <section className="dash-kpis">
        <article className="stat-card">
          <p className="stat-label">{copy.fee.yourRate}</p>
          <p className="stat-value">
            {actual !== null ? formatRatioAsPercent(actual) : '—'}
          </p>
        </article>
        <article className="stat-card">
          <p className="stat-label">{copy.fee.basketShare}</p>
          <p className="stat-value">
            {expected !== null ? formatRatioAsPercent(expected) : '—'}
          </p>
        </article>
        <article className="stat-card">
          <p className="stat-label">{copy.fee.contractShare}</p>
          <p className="stat-value">
            {tariff !== null ? formatRatioAsPercent(Math.abs(tariff)) : '—'}
          </p>
          <p className="stat-hint">
            {tariff === null ? '—' : better ? copy.fee.betterThanBasket : copy.fee.worseThanBasket}
          </p>
        </article>
        <article className="stat-card">
          <p className="stat-label">{copy.fee.pricesInCatalog}</p>
          <p className="stat-value">{formatCount(count(m.unique_prices ?? 0))}</p>
          <p className="stat-hint">{formatRial(Math.trunc(m.median_amount))}</p>
        </article>
      </section>

      <p className="leading-7 text-[color:var(--zp-muted)]">{copy.fee.basketVsTariff}</p>
      <p className="text-sm leading-7 text-[color:var(--zp-muted)]">{copy.feeDisclaimer}</p>

      <section className="dash-pair">
        <article className="chart-card space-y-3">
          <h2 className="chart-title">{copy.fee.realized}</h2>
          <p className="stat-value">{formatBillionsRial(m.fee_realized)}</p>
          <p className="leading-7 text-[color:var(--zp-muted)]">{copy.fee.potential}</p>
          <p className="stat-hint">{formatBillionsRial(m.fee_potential)}</p>
          <p className="leading-7 text-[color:var(--zp-muted)]">{copy.fee.floorTrap}</p>
        </article>
        <article className="chart-card">
          <FeeCalculator defaultBasket={defaultBasket} />
        </article>
      </section>

      <p className="mt-4 text-sm leading-7 text-[color:var(--zp-muted)]">
        <Link className="link-quiet font-medium" href="/m/M106">
          {copy.fee.floorStoryLink} · M106
        </Link>
      </p>
    </PageShell>
  );
}
