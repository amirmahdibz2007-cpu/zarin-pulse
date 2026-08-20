import { copy } from '@zarinpulse/contracts';
import { DepthLab } from '../../../components/DepthLab';
import { PageHeader, PageShell } from '../../../components/PageShell';

export const metadata = {
  robots: { index: false, follow: false },
};

export default function LabDepthPage() {
  return (
    <PageShell width="wide">
      <PageHeader kicker={copy.version.one} title={copy.lab.depthTitle} lede={copy.lab.depthLede} />
      <DepthLab />
    </PageShell>
  );
}
