import { copy } from '@zarinpulse/contracts';
import { AiStage } from '../../components/AiStage';
import { PageHeader, PageShell } from '../../components/PageShell';
import { readArtifact, type MerchantArtifact } from '../../lib/artifacts';
import { HOME_SAMPLE_MERCHANT_KEY } from '../../lib/merchant-periods';

export default function AiPage() {
  const m = readArtifact<MerchantArtifact>(`merchants/${HOME_SAMPLE_MERCHANT_KEY}.json`);

  return (
    <PageShell width="wide">
      <div className="ai-page">
        <PageHeader
          kicker={`${copy.homeMerchant.sampleBadge} · ${m.key}`}
          title={copy.nav.ai}
          lede={copy.aiStage.pageNote}
        />
        <AiStage
          merchantKey={m.key}
          category={m.category}
          variant="stack"
          detailHref={`/m/${m.key}`}
        />
      </div>
    </PageShell>
  );
}
