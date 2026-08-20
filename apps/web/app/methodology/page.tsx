import { copy } from '@zarinpulse/contracts';
import { PageHeader, PageShell } from '../../components/PageShell';

const ids = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'h8', 'h9', 'h10', 'h11', 'h12', 'h13'] as const;

const verdictOf: Record<(typeof ids)[number], keyof typeof copy.verdict> = {
  h1: 'untestable',
  h2: 'rejected',
  h3: 'untestable',
  h4: 'rejected',
  h5: 'rejected',
  h6: 'rejected',
  h7: 'confirmed',
  h8: 'confirmed',
  h9: 'rejected',
  h10: 'rejected',
  h11: 'rejected',
  h12: 'rejected',
  h13: 'rejected',
};

function pillClass(verdict: keyof typeof copy.verdict): string {
  if (verdict === 'confirmed') return 'status-pill status-pill-positive';
  if (verdict === 'rejected') return 'status-pill status-pill-negative';
  return 'status-pill status-pill-warning';
}

export default function MethodologyPage() {
  return (
    <PageShell width="wide">
      <PageHeader kicker={copy.product.name} title={copy.nav.methodology} lede={copy.feeDisclaimer} />
      <ul className="case-grid">
        {ids.map((id) => {
          const verdict = verdictOf[id];
          return (
            <li key={id} className="chart-card">
              <p className="font-medium leading-7">{copy.hypotheses[id]}</p>
              <p className={`mt-2 ${pillClass(verdict)}`}>{copy.verdict[verdict]}</p>
              <p className="mt-2 text-sm leading-7 text-[color:var(--zp-muted)]">
                {copy.hypothesisDetail[id]}
              </p>
            </li>
          );
        })}
      </ul>
    </PageShell>
  );
}
