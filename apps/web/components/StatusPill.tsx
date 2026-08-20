import { healthLabel } from '../lib/health';

function toneFor(code: string): 'positive' | 'negative' | 'warning' | 'neutral' {
  if (code === 'healthy') return 'positive';
  if (code === 'degraded') return 'warning';
  return 'negative';
}

export function StatusPill(props: { code: string }) {
  const tone = toneFor(props.code);
  const extra =
    tone === 'positive'
      ? 'status-pill-positive'
      : tone === 'negative'
        ? 'status-pill-negative'
        : tone === 'warning'
          ? 'status-pill-warning'
          : '';
  return <span className={`status-pill ${extra}`.trim()}>{healthLabel(props.code)}</span>;
}
