import { copy, count, formatCount } from '@zarinpulse/contracts';
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
  const verdicts = { confirmed: 0, rejected: 0, untestable: 0 };
  for (const id of ids) {
    verdicts[verdictOf[id]] += 1;
  }
  const total = ids.length;
  return (
    <PageShell width="wide">
      <PageHeader kicker={copy.product.name} title={copy.nav.methodology} lede={copy.feeDisclaimer} />
      <section className="chart-card space-y-4">
        <div className="verdict-bar" role="img" aria-label={copy.nav.methodology}>
          <span className="verdict-bar-seg verdict-ok" style={{ flexGrow: verdicts.confirmed }} />
          <span className="verdict-bar-seg verdict-bad" style={{ flexGrow: verdicts.rejected }} />
          <span className="verdict-bar-seg verdict-warn" style={{ flexGrow: verdicts.untestable }} />
        </div>
        <ul className="verdict-legend">
          <li>
            <span className="verdict-swatch verdict-ok" />
            {copy.verdict.confirmed} · {formatCount(count(verdicts.confirmed))} / {formatCount(count(total))}
          </li>
          <li>
            <span className="verdict-swatch verdict-bad" />
            {copy.verdict.rejected} · {formatCount(count(verdicts.rejected))} / {formatCount(count(total))}
          </li>
          <li>
            <span className="verdict-swatch verdict-warn" />
            {copy.verdict.untestable} · {formatCount(count(verdicts.untestable))} / {formatCount(count(total))}
          </li>
        </ul>
      </section>
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
