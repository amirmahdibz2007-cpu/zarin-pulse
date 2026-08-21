import { copy, formatBillionsRial, formatRatioAsPercent } from '@zarinpulse/contracts';
import Link from 'next/link';
import { MiniRing, RowBar } from '../../components/Charts';
import { PipelineLab } from '../../components/PipelineLab';
import { JudgeCodeMap } from '../../components/JudgeCodeMap';
import { PageHeader, PageShell } from '../../components/PageShell';
import { readArtifact, type MerchantIndexRow } from '../../lib/artifacts';
import { buildPipelineSteps } from '../../lib/pipeline-steps';

const featured = ['M91', 'M282', 'M31', 'M106', 'M250', 'M27', 'M319'] as const;

export default function JudgePage() {
  const index = readArtifact<MerchantIndexRow[]>('merchants-index.json');
  const sparse = index.find((m) => m.tier === 'sparse');
  const byKey = Object.fromEntries(index.map((m) => [m.key, m]));
  const recMax = Math.max(
    1,
    ...featured.map((key) => byKey[key]?.recoverable_rial ?? 0),
    sparse?.recoverable_rial ?? 0,
  );
  const steps = buildPipelineSteps();

  return (
    <PageShell width="wide">
      <PageHeader kicker={copy.product.name} title={copy.nav.judge} lede={copy.judgeIntro} />
      <p className="mb-4 text-sm leading-7 text-[color:var(--zp-muted)]">{copy.judgeDemoPath}</p>
      <PipelineLab steps={steps} note={copy.pipeline.noteProduct} />
      <h2 className="chart-title mt-8">{copy.pipeline.casesTitle}</h2>
      <ul className="case-grid">
        {featured.map((key) => {
          const m = byKey[key];
          return (
            <li key={key} className="chart-card">
              <Link className="link-quiet block min-h-11 text-lg font-medium" href={`/m/${key}`}>
                {key}
              </Link>
              <p className="text-sm leading-7 text-[color:var(--zp-muted)]">{copy.judge[key]}</p>
              {m ? (
                <div className="stat-card-row mt-3">
                  <div>
                    <p className="stat-value">{formatRatioAsPercent(m.success_rate)}</p>
                    <p className="stat-hint">{formatBillionsRial(m.recoverable_rial)}</p>
                    <RowBar value={m.recoverable_rial} max={recMax} />
                  </div>
                  <MiniRing ratio={m.success_rate} ticks size="m" />
                </div>
              ) : null}
            </li>
          );
        })}
        {sparse ? (
          <li className="chart-card">
            <Link className="link-quiet block min-h-11 text-lg font-medium" href={`/m/${sparse.key}`}>
              {sparse.key}
            </Link>
            <p className="text-sm leading-7 text-[color:var(--zp-muted)]">{copy.sparseNote}</p>
          </li>
        ) : null}
      </ul>
      <JudgeCodeMap />
      <div className="mt-4 flex flex-wrap gap-2">
        <Link className="control-neuro inline-flex min-h-11 items-center px-4" href="/reconciliation">
          {copy.nav.reconciliation}
        </Link>
        <Link className="control-neuro inline-flex min-h-11 items-center px-4" href="/methodology">
          {copy.nav.methodology}
        </Link>
      </div>
    </PageShell>
  );
}
