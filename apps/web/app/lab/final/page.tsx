import { copy } from '@zarinpulse/contracts';
import { FinalVisionLab } from '../../../components/FinalVisionLab';
import { PageHeader, PageShell } from '../../../components/PageShell';

export const metadata = {
  robots: { index: false, follow: false },
};

export default function LabFinalPage() {
  return (
    <PageShell width="wide">
      <PageHeader kicker={copy.version.one} title={copy.lab.visionTitle} lede={copy.lab.visionLede} />
      <FinalVisionLab />
    </PageShell>
  );
}
