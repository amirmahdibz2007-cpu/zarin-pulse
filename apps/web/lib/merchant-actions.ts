import {
  copy,
  formatBillionsRial,
  formatRatioAsPercent,
  formatRial,
} from '@zarinpulse/contracts';
import { healthAction, healthLabel } from './health';

/** Same sparse rule as packages/etl/src/build.ts when tier is missing on merchant JSON. */
export function isSparseMerchant(m: { sessions: number; tier?: string | undefined }): boolean {
  if (m.tier === 'sparse') return true;
  return m.sessions < 100;
}

export type MerchantActionKind =
  | 'sparse'
  | 'pending'
  | 'health'
  | 'funnel'
  | 'fee'
  | 'peer'
  | 'none';

export type MerchantAction = {
  kind: MerchantActionKind;
  title: string;
  body: string;
  why: string;
  nextStep: string;
  evidence: string;
  impactRial: number;
};

export type MerchantActionInput = {
  key: string;
  sessions: number;
  verified: number;
  no_attempt: number;
  in_bank: number;
  failed: number;
  paid_pending: number;
  paid_amount_rial: number;
  success_rate: number;
  health: string;
  tier?: string | undefined;
  unique_prices?: number | undefined;
  fee_actual: number | null;
  tariff_effect: number | null;
  peers: { n: number; p75: number; gap: number } | null;
  impact: { expected: number } | null;
};

const FUNNEL_FLOOR = 0.35;
const MAX_ACTIONS = 3;

function ratio(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return part / whole;
}

function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? '');
}

function recoverableClause(m: MerchantActionInput): string {
  const expected = m.impact?.expected ?? 0;
  if (expected <= 0) return '';
  return fill(copy.actionBrief.recoverableClause, {
    recoverable: formatBillionsRial(expected),
  });
}

function impactOf(m: MerchantActionInput): number {
  return Math.max(0, m.impact?.expected ?? 0);
}

/**
 * Ranked, merchant-specific actions from the same artifact the page already reads.
 * Paid (pending) outranks funnel holes; fee only when unique_prices === 1.
 */
export function buildMerchantActions(m: MerchantActionInput): MerchantAction[] {
  if (isSparseMerchant(m)) {
    return [
      {
        kind: 'sparse',
        title: m.key,
        body: copy.sparseNote,
        why: '',
        nextStep: '',
        evidence: '',
        impactRial: 0,
      },
    ];
  }

  const actions: MerchantAction[] = [];
  const sessions = Math.max(0, m.sessions);
  const na = ratio(m.no_attempt, sessions);
  const ib = ratio(m.in_bank, sessions);
  const fl = ratio(m.failed, sessions);
  const recClause = recoverableClause(m);
  const impactRial = impactOf(m);

  if (m.paid_amount_rial > 0) {
    actions.push({
      kind: 'pending',
      title: copy.actionBrief.pendingTitle,
      body: fill(copy.actionBrief.pendingBody, {
        amount: formatRial(Math.trunc(m.paid_amount_rial)),
      }),
      why: copy.actionBrief.pendingWhy,
      nextStep: copy.actionBrief.pendingNext,
      evidence: '',
      impactRial: Math.trunc(m.paid_amount_rial),
    });
  }

  if (m.health !== 'healthy') {
    const rateHint =
      m.health === 'pattern_1_no_bank_reach'
        ? formatRatioAsPercent(na)
        : m.health === 'pattern_2_verify_broken'
          ? formatRial(Math.trunc(m.paid_amount_rial))
          : formatRatioAsPercent(m.success_rate);
    actions.push({
      kind: 'health',
      title: copy.actionBrief.healthTitle,
      body: fill(copy.actionBrief.healthBody, {
        action: healthAction(m.health),
        recoverableClause: recClause,
      }),
      why: copy.actionBrief.healthWhy,
      nextStep: copy.actionBrief.healthNext,
      evidence: [healthLabel(m.health), rateHint].filter((s) => s.length > 0).join(' · '),
      impactRial,
    });
  } else if (na >= FUNNEL_FLOOR && na >= ib && na >= fl) {
    actions.push({
      kind: 'funnel',
      title: copy.actionBrief.noAttemptTitle,
      body: fill(copy.actionBrief.noAttemptBody, {
        share: formatRatioAsPercent(na),
        recoverableClause: recClause,
      }),
      why: copy.actionBrief.noAttemptWhy,
      nextStep: copy.actionBrief.noAttemptNext,
      evidence: '',
      impactRial,
    });
  }

  if (ib >= FUNNEL_FLOOR && ib >= na && ib >= fl) {
    actions.push({
      kind: 'funnel',
      title: copy.actionBrief.inBankTitle,
      body: fill(copy.actionBrief.inBankBody, {
        share: formatRatioAsPercent(ib),
        recoverableClause: recClause,
      }),
      why: copy.actionBrief.inBankWhy,
      nextStep: copy.actionBrief.inBankNext,
      evidence: '',
      impactRial,
    });
  }

  if (m.unique_prices === 1) {
    const feeClause =
      m.fee_actual !== null
        ? fill(copy.actionBrief.feeClause, { fee: formatRatioAsPercent(m.fee_actual) })
        : '';
    actions.push({
      kind: 'fee',
      title: copy.actionBrief.feeTitle,
      body: fill(copy.actionBrief.feeBody, { feeClause }),
      why: copy.actionBrief.feeWhy,
      nextStep: copy.actionBrief.feeNext,
      evidence: copy.feeDisclaimer,
      impactRial: 0,
    });
  }

  if (m.health === 'healthy' && m.peers && m.peers.gap > 0) {
    actions.push({
      kind: 'peer',
      title: copy.actionBrief.peerTitle,
      body: fill(copy.actionBrief.peerBody, {
        gap: formatRatioAsPercent(m.peers.gap),
        recoverableClause: recClause,
      }),
      why: copy.actionBrief.peerWhy,
      nextStep: copy.actionBrief.peerNext,
      evidence: '',
      impactRial,
    });
  }

  const trimmed = actions.slice(0, MAX_ACTIONS);
  if (trimmed.length === 0) {
    return [
      {
        kind: 'none',
        title: m.key,
        body: copy.actionBrief.none,
        why: '',
        nextStep: '',
        evidence: '',
        impactRial: 0,
      },
    ];
  }
  return trimmed;
}

/** First ranked action title for discovery surfaces (home table). */
export function primaryActionTitle(m: MerchantActionInput): string {
  return buildMerchantActions(m)[0]?.title ?? copy.actionBrief.none;
}

export function formatActionBriefClipboard(key: string, actions: readonly MerchantAction[]): string {
  const lines = [key, copy.threeActions];
  for (const [i, action] of actions.entries()) {
    lines.push(`${String(i + 1)}. ${action.title}`);
    lines.push(action.body);
    if (action.why) lines.push(`${copy.actionBrief.whyLabel}: ${action.why}`);
    if (action.nextStep) lines.push(`${copy.actionBrief.nextLabel}: ${action.nextStep}`);
    if (action.evidence) lines.push(action.evidence);
  }
  lines.push(copy.actionBrief.limitNote);
  return lines.join('\n');
}
