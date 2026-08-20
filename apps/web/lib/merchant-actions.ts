import {
  copy,
  formatBillionsRial,
  formatRatioAsPercent,
  formatRial,
} from '@zarinpulse/contracts';
import { healthAction, healthLabel } from './health';

/** Same sparse rule as packages/etl/src/build.ts when tier is missing on merchant JSON. */
export function isSparseMerchant(m: { sessions: number; tier?: string }): boolean {
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
  evidence: string;
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
  tier?: string;
  unique_prices?: number;
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

function recoverableEvidence(m: MerchantActionInput): string {
  const expected = m.impact?.expected ?? 0;
  if (expected <= 0) return '';
  return formatBillionsRial(expected);
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
        evidence: '',
      },
    ];
  }

  const actions: MerchantAction[] = [];
  const sessions = Math.max(0, m.sessions);
  const na = ratio(m.no_attempt, sessions);
  const ib = ratio(m.in_bank, sessions);
  const fl = ratio(m.failed, sessions);
  const rec = recoverableEvidence(m);

  if (m.paid_amount_rial > 0) {
    actions.push({
      kind: 'pending',
      title: copy.actionBrief.pendingTitle,
      body: copy.actionBrief.pendingBody,
      evidence: formatRial(Math.trunc(m.paid_amount_rial)),
    });
  }

  if (m.health !== 'healthy') {
    const rateHint =
      m.health === 'pattern_1_no_bank_reach'
        ? formatRatioAsPercent(na)
        : m.health === 'pattern_2_verify_broken'
          ? formatRial(Math.trunc(m.paid_amount_rial))
          : formatRatioAsPercent(m.success_rate);
    const bits = [healthLabel(m.health), rateHint, rec].filter((s) => s.length > 0);
    actions.push({
      kind: 'health',
      title: copy.actionBrief.healthTitle,
      body: healthAction(m.health),
      evidence: bits.join(' · '),
    });
  } else if (na >= FUNNEL_FLOOR && na >= ib && na >= fl) {
    actions.push({
      kind: 'funnel',
      title: copy.actionBrief.noAttemptTitle,
      body: copy.actionBrief.noAttemptBody,
      evidence: [formatRatioAsPercent(na), rec].filter((s) => s.length > 0).join(' · '),
    });
  }

  if (ib >= FUNNEL_FLOOR && ib >= na && ib >= fl) {
    actions.push({
      kind: 'funnel',
      title: copy.actionBrief.inBankTitle,
      body: copy.actionBrief.inBankBody,
      evidence: [formatRatioAsPercent(ib), rec].filter((s) => s.length > 0).join(' · '),
    });
  }

  if (m.unique_prices === 1) {
    const feeBits = [
      m.fee_actual !== null ? formatRatioAsPercent(m.fee_actual) : '',
      m.tariff_effect !== null && m.tariff_effect > 0
        ? formatRatioAsPercent(m.tariff_effect)
        : '',
      copy.feeDisclaimer,
    ].filter((s) => s.length > 0);
    actions.push({
      kind: 'fee',
      title: copy.actionBrief.feeTitle,
      body: copy.actionBrief.feeBody,
      evidence: feeBits.join(' · '),
    });
  }

  if (m.health === 'healthy' && m.peers && m.peers.gap > 0) {
    actions.push({
      kind: 'peer',
      title: copy.actionBrief.peerTitle,
      body: copy.actionBrief.peerBody,
      evidence: [formatRatioAsPercent(m.peers.gap), rec].filter((s) => s.length > 0).join(' · '),
    });
  }

  const trimmed = actions.slice(0, MAX_ACTIONS);
  if (trimmed.length === 0) {
    return [
      {
        kind: 'none',
        title: m.key,
        body: copy.actionBrief.none,
        evidence: '',
      },
    ];
  }
  return trimmed;
}

export function formatActionBriefClipboard(key: string, actions: readonly MerchantAction[]): string {
  const lines = [key, copy.threeActions];
  for (const [i, action] of actions.entries()) {
    lines.push(`${String(i + 1)}. ${action.title}`);
    lines.push(action.body);
    if (action.evidence) lines.push(action.evidence);
  }
  lines.push(copy.actionBrief.limitNote);
  return lines.join('\n');
}
