import { copy } from '@zarinpulse/contracts';
import { PageHeader, PageShell } from './PageShell';
import { HomeMerchantDash } from './HomeMerchantDash';
import { tryReadArtifact, type MerchantArtifact } from '../lib/artifacts';
import { HOME_SAMPLE_MERCHANT_KEY } from '../lib/merchant-periods';

export function HomeDash() {
  const merchant = tryReadArtifact<MerchantArtifact>(
    `merchants/${HOME_SAMPLE_MERCHANT_KEY}.json`,
  );

  if (!merchant) {
    return (
      <PageShell width="center">
        <PageHeader title={copy.product.name} lede={copy.product.tagline} />
        <p className="surface-panel text-sm leading-7">{copy.product.skeletonNote}</p>
      </PageShell>
    );
  }

  return (
    <PageShell width="wide">
      <HomeMerchantDash merchant={merchant} />
      <p className="note-warning surface-panel text-sm leading-7">{copy.feeDisclaimer}</p>
    </PageShell>
  );
}
