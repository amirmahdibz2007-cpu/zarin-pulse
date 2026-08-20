import { copy } from '@zarinpulse/contracts';
import { MotionLab } from '../../../components/MotionLab';
import { PageHeader, PageShell } from '../../../components/PageShell';

export const metadata = {
  robots: { index: false, follow: false },
};

export default function LabChartsPage() {
  return (
    <PageShell width="wide">
      <PageHeader kicker={copy.version.one} title={copy.lab.title} lede={copy.lab.lede} />
      <MotionLab />
    </PageShell>
  );
}
