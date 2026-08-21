import { copy, formatBillionsRial } from '@zarinpulse/contracts';
import {
  formatActionBriefClipboard,
  type MerchantAction,
} from '../lib/merchant-actions';
import { CopyBriefButton } from './CopyBriefButton';

function rankLabel(n: number): string {
  return copy.actionBrief.rankLabel.replace('{n}', String(n));
}

export function ActionBrief(props: { merchantKey: string; actions: readonly MerchantAction[] }) {
  const clipboard = formatActionBriefClipboard(props.merchantKey, props.actions);
  return (
    <section className="action-brief" aria-label={copy.threeActions}>
      <div className="action-brief-head">
        <div>
          <p className="action-brief-kicker">{props.merchantKey}</p>
          <h2 className="action-brief-title">{copy.threeActions}</h2>
        </div>
        <CopyBriefButton text={clipboard} />
      </div>
      <ol className="action-brief-list">
        {props.actions.map((action, index) => (
          <li key={`${action.kind}-${action.title}`} className="action-brief-card">
            <div className="action-brief-card-top">
              <span className="action-brief-rank" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="action-brief-card-main">
                <p className="action-brief-priority">{rankLabel(index + 1)}</p>
                <p className="action-brief-card-title">{action.title}</p>
                <p className="action-brief-card-body">{action.body}</p>
                {action.why ? (
                  <p className="action-brief-why">
                    <span>{copy.actionBrief.whyLabel}</span>
                    {action.why}
                  </p>
                ) : null}
                {action.nextStep ? (
                  <p className="action-brief-next">
                    <span>{copy.actionBrief.nextLabel}</span>
                    {action.nextStep}
                  </p>
                ) : null}
                {action.evidence ? (
                  <p className="action-brief-evidence">{action.evidence}</p>
                ) : null}
              </div>
              {action.impactRial > 0 ? (
                <div className="action-brief-impact">
                  <p className="action-brief-impact-label">{copy.actionBrief.impactLabel}</p>
                  <p className="action-brief-impact-value">{formatBillionsRial(action.impactRial)}</p>
                </div>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
      <p className="action-brief-note">{copy.actionBrief.limitNote}</p>
    </section>
  );
}
