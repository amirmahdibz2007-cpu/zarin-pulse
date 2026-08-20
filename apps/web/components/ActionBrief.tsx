import { copy } from '@zarinpulse/contracts';
import {
  formatActionBriefClipboard,
  type MerchantAction,
} from '../lib/merchant-actions';
import { CopyBriefButton } from './CopyBriefButton';

export function ActionBrief(props: { merchantKey: string; actions: readonly MerchantAction[] }) {
  const clipboard = formatActionBriefClipboard(props.merchantKey, props.actions);
  return (
    <section className="surface-panel space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium">{copy.threeActions}</p>
        <CopyBriefButton text={clipboard} />
      </div>
      <ol className="list-decimal space-y-3 pr-5 leading-7">
        {props.actions.map((action) => (
          <li key={`${action.kind}-${action.title}`}>
            <p className="font-medium">{action.title}</p>
            <p>{action.body}</p>
            {action.evidence ? (
              <p className="text-sm text-[color:var(--zp-muted)]">{action.evidence}</p>
            ) : null}
          </li>
        ))}
      </ol>
      <p className="text-sm text-[color:var(--zp-muted)]">{copy.actionBrief.limitNote}</p>
    </section>
  );
}
