import { copy, formatRatioAsPercent } from '@zarinpulse/contracts';
import Link from 'next/link';
import { MiniRing } from '../../components/Charts';
import { PageHeader, PageShell } from '../../components/PageShell';
import { readArtifact, type MerchantArtifact } from '../../lib/artifacts';

export default function CustomersPage() {
  const m27 = readArtifact<MerchantArtifact>('merchants/M27.json');
  const m319 = readArtifact<MerchantArtifact>('merchants/M319.json');
  const model27 =
    m27.business_model && m27.business_model in copy.businessModel
      ? copy.businessModel[m27.business_model as keyof typeof copy.businessModel]
      : copy.businessModel.insufficient;
  const model319 =
    m319.business_model && m319.business_model in copy.businessModel
      ? copy.businessModel[m319.business_model as keyof typeof copy.businessModel]
      : copy.businessModel.insufficient;
  const repeat =
    m27.repeat_customers && m27.customers ? m27.repeat_customers / m27.customers : null;
  return (
    <PageShell width="wide">
      <PageHeader kicker={copy.product.name} title={copy.nav.customers} lede={copy.insufficient.column_mostly_null} />
      <section className="dash-pair">
        <article className="chart-card stat-card-row">
          <div>
            <Link href="/m/M27" className="link-quiet font-medium">
              M27
            </Link>
            <p className="leading-7">{model27}</p>
            {repeat !== null ? <p className="stat-value">{formatRatioAsPercent(repeat)}</p> : null}
          </div>
          {repeat !== null ? <MiniRing ratio={repeat} ticks size="m" /> : null}
        </article>
        <article className="chart-card">
          <Link href="/m/M319" className="link-quiet font-medium">
            M319
          </Link>
          <p className="leading-7">{model319}</p>
        </article>
      </section>
      <a className="control-neuro inline-flex min-h-11 items-center px-4" href="/api/download/at-risk">
        {copy.downloadAtRisk}
      </a>
    </PageShell>
  );
}
