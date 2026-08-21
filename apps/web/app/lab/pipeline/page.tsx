import { copy } from '@zarinpulse/contracts';
import { PipelineLab } from '../../../components/PipelineLab';
import { PageHeader, PageShell } from '../../../components/PageShell';
import { buildPipelineSteps } from '../../../lib/pipeline-steps';

export const metadata = {
  robots: { index: false, follow: false },
};

export default function LabPipelinePage() {
  return (
    <PageShell width="wide">
      <PageHeader
        kicker={copy.product.name}
        title={copy.pipeline.title}
        lede={copy.pipeline.noteLab}
      />
      <PipelineLab steps={buildPipelineSteps()} note={copy.pipeline.noteLab} />
    </PageShell>
  );
}
