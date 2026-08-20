import { copy, formatCount, count } from '@zarinpulse/contracts';
import { notFound } from 'next/navigation';
import { PageHeader, PageShell } from '../../../components/PageShell';
import { tryReadArtifact, type PassportArtifact } from '../../../lib/artifacts';

export default async function PassportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const p = tryReadArtifact<PassportArtifact>(`passports/${decoded}.json`);
  if (!p) notFound();
  return (
    <PageShell>
      <PageHeader title={copy.passportTitle} />
      <p className="font-mono text-sm">{p.id}</p>
      <p>
        {copy.passportGrain}: {p.grain}
      </p>
      <p>
        {copy.passportSample}: {formatCount(count(p.n))}
      </p>
      <p className="break-all text-sm text-[color:var(--zp-muted)]">
        {copy.passportSha}: {p.sourceSha256}
      </p>
      <p className="text-sm">{copy.passportSql}</p>
      <pre className="surface-well overflow-x-auto p-4 text-xs">{p.sql}</pre>
    </PageShell>
  );
}
