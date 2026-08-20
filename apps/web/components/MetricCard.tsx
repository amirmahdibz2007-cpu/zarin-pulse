import type { ReactNode } from 'react';
import { copy } from '@zarinpulse/contracts';
import { DetailDisclosure } from './DetailDisclosure';
import { EvidenceLink } from './EvidenceLink';

export function MetricCard(props: {
  plainFa: string;
  technicalFa: string;
  value: ReactNode;
  kind?: 'ok' | 'insufficient' | 'not_applicable';
  insufficientReason?: keyof typeof copy.insufficient;
  passportId?: string;
  tone?: 'neutral' | 'positive' | 'negative' | 'warning';
  size?: 'default' | 'hero';
}) {
  if (props.kind === 'insufficient' && props.insufficientReason) {
    return (
      <article className="surface-kpi">
        <p className="kpi-plain">{copy.insufficient[props.insufficientReason]}</p>
      </article>
    );
  }
  if (props.kind === 'not_applicable' && props.insufficientReason) {
    return (
      <article className="surface-kpi" style={{ borderStyle: 'dashed' }}>
        <p className="kpi-plain">{copy.insufficient[props.insufficientReason]}</p>
      </article>
    );
  }
  const tone = props.tone ?? 'neutral';
  const valueClass =
    tone === 'positive'
      ? 'kpi-value kpi-value-positive'
      : tone === 'negative'
        ? 'kpi-value kpi-value-negative'
        : tone === 'warning'
          ? 'kpi-value kpi-value-warning'
          : 'kpi-value';
  return (
    <article className="surface-kpi">
      <div className={props.size === 'hero' ? 'hero-value' : valueClass}>{props.value}</div>
      <p className="kpi-plain">{props.plainFa}</p>
      <DetailDisclosure technicalFa={props.technicalFa} />
      {props.passportId ? <EvidenceLink passportId={props.passportId} /> : null}
    </article>
  );
}
