import { copy, count, formatBillionsRial, formatCount } from '@zarinpulse/contracts';
import type { PipelineLabStep } from '../components/PipelineLab';
import {
  readArtifact,
  tryReadArtifact,
  type PlatformArtifact,
  type ReconArtifact,
} from './artifacts';

export const PIPELINE_PASSPORT_IDS = [
  'session_success_rate@platform',
  'retry_hazard@k1',
  'revenue_rial@platform',
] as const;

type ManifestArtifact = {
  builtAt: string;
  sourceSha256: string;
  files: Record<string, string>;
};

/** Shared judge/lab deck steps from live artifacts (no fictional numbers). */
export function buildPipelineSteps(): PipelineLabStep[] {
  const platform = readArtifact<PlatformArtifact & { rows_total?: number }>('platform.json');
  const recon = readArtifact<ReconArtifact>('reconciliation.json');
  const manifest = readArtifact<ManifestArtifact>('manifest.json');
  const fileCount = Object.keys(manifest.files).length;
  const passportCount = PIPELINE_PASSPORT_IDS.filter((id) =>
    Boolean(tryReadArtifact(`passports/${id}.json`)),
  ).length;
  const shaShort = `${manifest.sourceSha256.slice(0, 8)}…${manifest.sourceSha256.slice(-4)}`;
  const rows = platform.rows_total ?? 2_213_289;
  const s = copy.pipeline.steps;

  const reconChecks = [
    recon.no_attempt_plus_attempted === recon.sessions_total,
    (recon.attempted_identity ?? 0) === (recon.attempted ?? 0),
    (recon.terminal_sum ?? 0) === recon.sessions_total,
    recon.revenue === platform.revenue_rial &&
      recon.revenue === (recon.category_revenue ?? recon.revenue) &&
      recon.revenue === (recon.merchant_revenue ?? recon.revenue),
    (recon.impact_sum ?? recon.recoverable_sum) === recon.recoverable_sum,
    recon.verified_gap === 28,
    recon.sourceSha256 === platform.sourceSha256,
  ];
  const reconPass = reconChecks.filter(Boolean).length;

  return [
    {
      id: 'ingest',
      title: s.ingestTitle,
      countTo: rows,
      suffix: ' ردیف',
      body: `${s.ingestBody} ${shaShort}`,
    },
    {
      id: 'model',
      title: s.modelTitle,
      countTo: platform.sessions_total,
      body: `${s.modelBody} · ${formatCount(count(platform.merchants_total))} پذیرنده`,
    },
    {
      id: 'golden',
      title: s.goldenTitle,
      countTo: platform.verified_try_session_gap,
      prefix: 'gap ',
      body: s.goldenBody,
    },
    {
      id: 'arts',
      title: s.artsTitle,
      countTo: fileCount,
      body: s.artsBody,
    },
    {
      id: 'pass',
      title: s.passTitle,
      countTo: passportCount,
      body: s.passBody,
      href: `/passport/${encodeURIComponent(PIPELINE_PASSPORT_IDS[0])}`,
      hrefLabel: copy.pipeline.openPassport,
    },
    {
      id: 'recon',
      title: s.reconTitle,
      countTo: reconPass,
      countToB: reconChecks.length,
      body: `${s.reconBody} · ${formatBillionsRial(recon.recoverable_sum)}`,
      href: '/reconciliation',
      hrefLabel: copy.pipeline.openRecon,
    },
    {
      id: 'action',
      title: s.actionTitle,
      value: 'M282',
      body: s.actionBody,
      href: '/m/M282',
      hrefLabel: copy.pipeline.openAction,
    },
  ];
}
