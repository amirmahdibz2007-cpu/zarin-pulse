import { copy } from '@zarinpulse/contracts';
import { OpsSuite } from '../../components/OpsSuite';
import { PageHeader, PageShell } from '../../components/PageShell';
import { readMerchantArtifact } from '../../lib/artifacts';

export default function CustomersPage() {
  const merchant = readMerchantArtifact('M31');
  return (
    <PageShell width="wide">
      <PageHeader
        kicker={`${copy.efficacy.sampleKicker} · ${merchant.key}`}
        title={copy.nav.customers}
        lede={copy.ops.lede}
      />
      <OpsSuite merchant={merchant} />
      <p className="stat-hint ops-footer-links">
        <span>{copy.efficacy.platformSection}: </span>
        <a className="link-quiet font-medium" href="/api/download/at-risk">
          {copy.downloadAtRisk}
        </a>
        {' · '}
        <a className="link-quiet font-medium" href="/api/download/paid-pending">
          {copy.downloadPaid}
        </a>
      </p>
    </PageShell>
  );
}
