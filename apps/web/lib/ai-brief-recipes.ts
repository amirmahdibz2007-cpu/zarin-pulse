/**
 * Per-prompt locked metrics + high-quality deterministic answers (no model required).
 */

import {
  copy,
  formatBillionsFigure,
  formatBillionsRial,
  formatCount,
  formatRatioAsPercent,
  formatRial,
  count,
  MONTHS_FA,
  WEEKDAYS_FA,
} from '@zarinpulse/contracts';
import type { MerchantArtifact } from './artifacts';
import {
  buildAiBriefLockedInput,
  type AiBriefAnswer,
  type AiBriefLockedInput,
  type AiBriefModelAction,
  type AiPromptId,
} from './ai-brief-prompt';
import { healthLabel } from './health';
import { buildMerchantActions, formatActionBriefClipboard } from './merchant-actions';

function monthLabel(key: string): string {
  const part = key.split('-')[1];
  const idx = Number(part) - 1;
  return MONTHS_FA[idx] ?? key;
}

function impactBillions(actions: ReturnType<typeof buildMerchantActions>): (string | null)[] {
  return actions.map((a) => (a.impactRial > 0 ? formatBillionsFigure(a.impactRial) : null));
}

function ratio(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return part / whole;
}

export function buildLockedMetrics(m: MerchantArtifact): Record<string, string | number> {
  const sessions = Math.max(0, m.sessions);
  const lastMonth = m.series?.jalali_months?.at(-1);
  const prevMonth = m.series?.jalali_months?.at(-2);
  const weekRows = (m.series?.weekdays ?? []).slice().sort((a, b) => a.weekday - b.weekday);
  const peakWeek = weekRows.reduce<(typeof weekRows)[number] | null>((best, row) => {
    if (!best || row.sessions > best.sessions) return row;
    return best;
  }, null);

  const reachedBank = sessions - m.no_attempt;
  const noAttemptShare = ratio(m.no_attempt, sessions);
  const inBankShare = ratio(m.in_bank, sessions);
  const verifiedShare = ratio(m.verified, sessions);
  const failedShare = ratio(m.failed, sessions);

  let monthTrend = 'نامشخص';
  if (lastMonth && prevMonth && prevMonth.revenue_rial > 0) {
    const delta = (lastMonth.revenue_rial - prevMonth.revenue_rial) / prevMonth.revenue_rial;
    if (delta > 0.03) monthTrend = `رشد حدود ${formatRatioAsPercent(delta)} نسبت به ماه قبل`;
    else if (delta < -0.03)
      monthTrend = `افت حدود ${formatRatioAsPercent(Math.abs(delta))} نسبت به ماه قبل`;
    else monthTrend = 'تقریباً هم‌سطح ماه قبل';
  }

  const modelLabel =
    m.business_model && m.business_model in copy.businessModel
      ? copy.businessModel[m.business_model as keyof typeof copy.businessModel]
      : '';

  const avgTicket =
    m.aov != null && Number.isFinite(m.aov) ? Math.round(m.aov) : null;
  const medianTicket =
    Number.isFinite(m.median_amount) ? Math.round(m.median_amount) : null;

  return {
    sessions,
    sessions_label: formatCount(count(sessions)),
    verified: m.verified,
    verified_label: formatCount(count(m.verified)),
    no_attempt: m.no_attempt,
    no_attempt_label: formatCount(count(m.no_attempt)),
    in_bank: m.in_bank,
    in_bank_label: formatCount(count(m.in_bank)),
    failed: m.failed,
    failed_label: formatCount(count(m.failed)),
    paid_pending: m.paid_pending,
    paid_pending_label: formatCount(count(Math.max(0, m.paid_pending))),
    success_rate: formatRatioAsPercent(m.success_rate),
    no_attempt_share: formatRatioAsPercent(noAttemptShare),
    in_bank_share: formatRatioAsPercent(inBankShare),
    verified_share: formatRatioAsPercent(verifiedShare),
    failed_share: formatRatioAsPercent(failedShare),
    reached_bank_ratio: formatRatioAsPercent(ratio(reachedBank, sessions)),
    verified_ratio: formatRatioAsPercent(verifiedShare),
    opened_label: formatCount(count(sessions)),
    revenue_rial_billions: formatBillionsFigure(m.revenue_rial),
    revenue_full: formatBillionsRial(m.revenue_rial),
    attempted_amount_rial_billions:
      m.attempted_amount_rial != null && Number.isFinite(m.attempted_amount_rial)
        ? formatBillionsFigure(m.attempted_amount_rial)
        : '0',
    recoverable_rial_billions: m.impact ? formatBillionsFigure(m.impact.expected) : '0',
    recoverable_full: m.impact ? formatBillionsRial(m.impact.expected) : '',
    recoverable_conservative_rial_billions: m.impact
      ? formatBillionsFigure(m.impact.conservative)
      : '0',
    recoverable_optimistic_rial_billions: m.impact
      ? formatBillionsFigure(m.impact.optimistic)
      : '0',
    impact_basis: m.impact?.basis ?? '',
    peer_gap: m.peers && m.peers.gap > 0 ? formatRatioAsPercent(m.peers.gap) : '0',
    peer_n: m.peers?.n ?? 0,
    peer_p75_success:
      m.peers && m.peers.p75 > 0 ? formatRatioAsPercent(m.peers.p75) : '0',
    month_label: lastMonth ? monthLabel(lastMonth.key) : '',
    month_revenue_rial_billions: lastMonth
      ? formatBillionsFigure(lastMonth.revenue_rial)
      : formatBillionsFigure(m.revenue_rial),
    month_orders: lastMonth ? lastMonth.orders : m.verified,
    month_orders_label: formatCount(count(lastMonth ? lastMonth.orders : m.verified)),
    month_trend: monthTrend,
    health_label: healthLabel(m.health),
    health_raw: m.health,
    tier: m.tier ?? '',
    business_model_label: modelLabel,
    business_model: m.business_model ?? '',
    case_family: m.case_family ?? '',
    peak_weekday: peakWeek ? (WEEKDAYS_FA[peakWeek.weekday] ?? '') : '',
    peak_weekday_sessions: peakWeek ? formatCount(count(peakWeek.sessions)) : '',
    pending_rial_billions:
      m.paid_amount_rial > 0 ? formatBillionsFigure(m.paid_amount_rial) : '0',
    pending_recon_rial_billions:
      m.pending?.rial > 0 ? formatBillionsFigure(m.pending.rial) : '0',
    median_ticket_rial: medianTicket != null ? formatRial(medianTicket) : '',
    avg_ticket_rial: avgTicket != null ? formatRial(avgTicket) : '',
    unique_prices: m.unique_prices ?? 0,
    customers: m.customers ?? 0,
    customers_label:
      m.customers != null ? formatCount(count(Math.max(0, m.customers))) : '',
    repeat_customers: m.repeat_customers ?? 0,
    repeat_customers_label:
      m.repeat_customers != null
        ? formatCount(count(Math.max(0, m.repeat_customers)))
        : '',
    repeat_order_share:
      m.repeat_order_share != null && Number.isFinite(m.repeat_order_share)
        ? formatRatioAsPercent(m.repeat_order_share)
        : '',
    fee_actual_rate:
      m.fee_actual != null && Number.isFinite(m.fee_actual)
        ? formatRatioAsPercent(m.fee_actual)
        : '',
    fee_expected_rate:
      m.fee_expected != null && Number.isFinite(m.fee_expected)
        ? formatRatioAsPercent(m.fee_expected)
        : '',
    tariff_effect_rate:
      m.tariff_effect != null && Number.isFinite(m.tariff_effect)
        ? formatRatioAsPercent(m.tariff_effect)
        : '',
    fee_realized_rial_billions: formatBillionsFigure(m.fee_realized),
    fee_potential_rial_billions: formatBillionsFigure(m.fee_potential),
    daily_points: m.series?.daily?.length ?? 0,
    month_points: m.series?.jalali_months?.length ?? 0,
  };
}

/**
 * Every artifact fact available for this merchant, formatted for grounded LLM use.
 * Keys avoid forbidden product jargon (no AOV/KPI/…). Model must not invent beyond this.
 */
export function buildMerchantDossier(m: MerchantArtifact): Record<string, unknown> {
  const metrics = buildLockedMetrics(m);
  const months = (m.series?.jalali_months ?? []).map((row) => ({
    key: row.key,
    label: monthLabel(row.key),
    days: row.days,
    sessions: row.sessions ?? 0,
    sessions_label: formatCount(count(Math.max(0, row.sessions ?? 0))),
    orders: row.orders,
    orders_label: formatCount(count(Math.max(0, row.orders))),
    revenue_rial_billions: formatBillionsFigure(row.revenue_rial),
    revenue_full: formatBillionsRial(row.revenue_rial),
    per_day_revenue_rial_billions: formatBillionsFigure(row.per_day_revenue),
    avg_ticket_rial: Number.isFinite(row.aov) ? formatRial(Math.round(row.aov)) : '',
  }));
  const weekdays = (m.series?.weekdays ?? [])
    .slice()
    .sort((a, b) => a.weekday - b.weekday)
    .map((row) => ({
      weekday: row.weekday,
      weekday_label: WEEKDAYS_FA[row.weekday] ?? String(row.weekday),
      sessions: row.sessions,
      sessions_label: formatCount(count(Math.max(0, row.sessions))),
      orders: row.orders,
      orders_label: formatCount(count(Math.max(0, row.orders))),
      revenue_rial_billions: formatBillionsFigure(row.revenue_rial),
      avg_ticket_rial: Number.isFinite(row.aov) ? formatRial(Math.round(row.aov)) : '',
    }));
  /** Full daily history is large for LLM latency; keep a recent window + totals. */
  const DAILY_WINDOW = 21;
  const dailyAll = m.series?.daily ?? [];
  const dailySlice = dailyAll.length > DAILY_WINDOW ? dailyAll.slice(-DAILY_WINDOW) : dailyAll;
  const daily = dailySlice.map((row) => ({
    day: row.day,
    sessions: row.sessions,
    orders: row.orders,
    revenue_rial_billions: formatBillionsFigure(row.revenue_rial),
  }));

  return {
    identity: {
      key: m.key,
      category: m.category,
      health: metrics.health_label,
      health_raw: m.health,
      tier: m.tier,
      business_model: metrics.business_model,
      business_model_label: metrics.business_model_label,
      case_family: metrics.case_family,
    },
    funnel: {
      sessions: metrics.sessions,
      sessions_label: metrics.sessions_label,
      no_attempt: metrics.no_attempt,
      no_attempt_label: metrics.no_attempt_label,
      no_attempt_share: metrics.no_attempt_share,
      in_bank: metrics.in_bank,
      in_bank_label: metrics.in_bank_label,
      in_bank_share: metrics.in_bank_share,
      failed: metrics.failed,
      failed_label: metrics.failed_label,
      failed_share: metrics.failed_share,
      verified: metrics.verified,
      verified_label: metrics.verified_label,
      verified_share: metrics.verified_share,
      paid_pending: metrics.paid_pending,
      paid_pending_label: metrics.paid_pending_label,
      success_rate: metrics.success_rate,
      reached_bank_ratio: metrics.reached_bank_ratio,
    },
    money: {
      revenue_rial_billions: metrics.revenue_rial_billions,
      revenue_full: metrics.revenue_full,
      attempted_amount_rial_billions: metrics.attempted_amount_rial_billions,
      median_ticket_rial: metrics.median_ticket_rial,
      avg_ticket_rial: metrics.avg_ticket_rial,
      unique_prices: metrics.unique_prices,
      pending_paid_rial_billions: metrics.pending_rial_billions,
      pending_recon_rial_billions: metrics.pending_recon_rial_billions,
    },
    customers: {
      customers: metrics.customers,
      customers_label: metrics.customers_label,
      repeat_customers: metrics.repeat_customers,
      repeat_customers_label: metrics.repeat_customers_label,
      repeat_order_share: metrics.repeat_order_share,
    },
    fees: {
      fee_actual_rate: metrics.fee_actual_rate,
      fee_expected_rate: metrics.fee_expected_rate,
      tariff_effect_rate: metrics.tariff_effect_rate,
      fee_realized_rial_billions: metrics.fee_realized_rial_billions,
      fee_potential_rial_billions: metrics.fee_potential_rial_billions,
    },
    peers: m.peers
      ? {
          n: metrics.peer_n,
          p75_success: metrics.peer_p75_success,
          gap: metrics.peer_gap,
        }
      : null,
    impact: m.impact
      ? {
          basis: metrics.impact_basis,
          expected_rial_billions: metrics.recoverable_rial_billions,
          expected_full: metrics.recoverable_full,
          conservative_rial_billions: metrics.recoverable_conservative_rial_billions,
          optimistic_rial_billions: metrics.recoverable_optimistic_rial_billions,
        }
      : null,
    series: {
      jalali_months: months,
      weekdays,
      daily,
      daily_count: dailyAll.length,
      daily_window: dailySlice.length,
      daily_note:
        dailyAll.length > DAILY_WINDOW
          ? `last_${DAILY_WINDOW}_of_${dailyAll.length}`
          : 'all',
      month_count: months.length,
    },
  };
}

export function buildStoryBeats(m: MerchantArtifact): string[] {
  const metrics = buildLockedMetrics(m);
  const actions = buildMerchantActions(m);
  const primary = actions[0];
  const beats: string[] = [
    `پذیرنده ${m.key} در صنف «${m.category}» است؛ وضعیت درگاه: ${metrics.health_label}.`,
    `از ${metrics.sessions_label} جلسه، نرخ موفقیت ${metrics.success_rate} است (${metrics.verified_label} موفق).`,
    `ریزش: ${metrics.no_attempt_share} قبل از بانک (${metrics.no_attempt_label}) و ${metrics.in_bank_share} روی بانک (${metrics.in_bank_label}).`,
  ];
  if (String(metrics.recoverable_rial_billions) !== '0' && metrics.recoverable_full) {
    beats.push(`فرصت فروش قابل بازیابی قفل‌شده حدود ${metrics.recoverable_full} است.`);
  }
  if (m.peers && m.peers.gap > 0) {
    beats.push(
      `فاصله موفقیت با هم‌صنف‌های خوب حدود ${metrics.peer_gap} است (مرجع خوب حدود ${metrics.peer_p75_success}).`,
    );
  }
  if (metrics.month_label) {
    beats.push(
      `فروش ${metrics.month_label} حدود ${metrics.month_revenue_rial_billions} میلیارد ریال است؛ ${metrics.month_trend}.`,
    );
  }
  if (metrics.peak_weekday) {
    beats.push(
      `اوج ترافیک هفتگی در ${metrics.peak_weekday} با حدود ${metrics.peak_weekday_sessions} جلسه است.`,
    );
  }
  if (primary) {
    beats.push(`اولویت قفل‌شدهٔ اقدام: «${primary.title}» — ${primary.nextStep}`);
  }
  if (metrics.customers_label) {
    beats.push(
      `مشتری یکتا حدود ${metrics.customers_label} است` +
        (metrics.repeat_customers_label
          ? `؛ تکراری حدود ${metrics.repeat_customers_label}` +
            (metrics.repeat_order_share
              ? ` با سهم سفارش تکراری ${metrics.repeat_order_share}`
              : '')
          : '') +
        '.',
    );
  }
  if (metrics.avg_ticket_rial) {
    beats.push(`میانگین سبد حدود ${metrics.avg_ticket_rial} و میانه مبلغ ${metrics.median_ticket_rial || '—'} است.`);
  }
  if (metrics.fee_realized_rial_billions && String(metrics.fee_realized_rial_billions) !== '۰' && String(metrics.fee_realized_rial_billions) !== '0') {
    beats.push(
      `کارمزد تحقق‌یافته حدود ${metrics.fee_realized_rial_billions} میلیارد ریال است` +
        (metrics.fee_actual_rate ? ` (نرخ حدود ${metrics.fee_actual_rate})` : '') +
        '.',
    );
  }
  return beats;
}

export function buildLockedForMerchant(
  m: MerchantArtifact,
  promptId: AiPromptId,
  userMessage?: string,
): AiBriefLockedInput {
  const actions = buildMerchantActions(m);
  return buildAiBriefLockedInput({
    key: m.key,
    promptId,
    category: m.category,
    metrics: buildLockedMetrics(m),
    dossier: buildMerchantDossier(m),
    storyBeats: buildStoryBeats(m),
    actions,
    impactBillionsByIndex: impactBillions(actions),
    ...(userMessage ? { userMessage } : {}),
  });
}

function enrichActions(
  locked: AiBriefLockedInput,
  polish: (a: AiBriefModelAction) => AiBriefModelAction,
): AiBriefModelAction[] {
  return locked.ranked_actions.map((a) =>
    polish({
      rank: a.rank,
      title: a.title,
      body: a.body,
      why: a.why,
      next_step: a.next_step,
      impact_phrase: a.impact_rial_billions
        ? `${a.impact_rial_billions} میلیارد ریال`
        : null,
    }),
  );
}

export function deterministicAiBrief(
  locked: AiBriefLockedInput,
  m: MerchantArtifact,
): AiBriefAnswer {
  const metrics = locked.locked_metrics;
  const beats = locked.story_beats;
  const primaryLocked = locked.ranked_actions[0];
  let summary: string;
  let actions: AiBriefModelAction[];

  switch (locked.prompt_id) {
    case 'overview': {
      const impact =
        primaryLocked?.impact_rial_billions && String(metrics.recoverable_rial_billions) !== '0'
          ? ` اگر همین اولویت را جمع کنید، فرصت قفل‌شده حدود ${metrics.recoverable_full || `${primaryLocked.impact_rial_billions} میلیارد ریال`} است.`
          : '';
      summary = primaryLocked
        ? `برای ${m.key} در «${m.category}»، مهم‌ترین سیگنال همین است: «${primaryLocked.title}». ${primaryLocked.body}${impact} نرخ موفقیت فعلی ${metrics.success_rate} است؛ قدم امروز: ${primaryLocked.next_step}`
        : beats.slice(0, 3).join(' ');
      actions = enrichActions(locked, (a) => ({
        ...a,
        body: a.body,
        why: a.why || 'این مورد از الگوی ثبت‌شدهٔ همین پذیرنده آمده است.',
        next_step: a.next_step,
      }));
      break;
    }
    case 'grow_sales': {
      summary = primaryLocked
        ? `راه رشد فروش برای شما از تبلیغات کلی نیست؛ از بستن سوراخ «${primaryLocked.title}» است. ${primaryLocked.next_step}${
            primaryLocked.impact_rial_billions
              ? ` اثر ریالی قفل‌شده حدود ${primaryLocked.impact_rial_billions} میلیارد ریال است.`
              : ''
          } اول همین را درست کنید، بعد سراغ بقیه بروید.`
        : copy.aiStage.fallbackEmpty;
      actions = enrichActions(locked, (a) => ({
        ...a,
        body: `${a.body} این مستقیم روی تبدیل جلسه به فروش اثر می‌گذارد.`,
        next_step: a.next_step,
      }));
      break;
    }
    case 'why_drop': {
      summary = `مسیر مشتری را با عددهای همین صفحه ببینید: از ${metrics.opened_label} جلسه بازشده، حدود ${metrics.reached_bank_ratio} به بانک می‌رسند و ${metrics.verified_ratio} موفق می‌شوند. ${metrics.no_attempt_label} جلسه قبل از بانک رها می‌شوند (${metrics.no_attempt_share}) و ${metrics.in_bank_label} روی بانک می‌مانند (${metrics.in_bank_share}). بیشترین فشار معمولاً همان جایی است که اولویت اقدام‌ها نشان می‌دهد.`;
      actions = enrichActions(locked, (a) => a);
      break;
    }
    case 'peer_gap': {
      const gap = String(metrics.peer_gap);
      if (gap === '0' || !m.peers || m.peers.gap <= 0) {
        summary = `${copy.aiStage.peerOk} نرخ موفقیت شما ${metrics.success_rate} است؛ تمرکز را روی حفظ کیفیت درگاه و اقدام‌های rank=1 بگذارید.`;
      } else {
        summary = primaryLocked
          ? `هم‌صنف‌های خوب حدود ${metrics.peer_p75_success} موفقیت دارند و فاصلهٔ شما حدود ${gap} است. ${primaryLocked.body} کار عملی: ${primaryLocked.next_step}`
          : `فاصله با هم‌صنف‌های خوب حدود ${gap} است.`;
      }
      actions = enrichActions(locked, (a) => a);
      break;
    }
    case 'this_month': {
      const month = String(metrics.month_label || copy.aiStage.monthFallback);
      summary = primaryLocked
        ? `در ${month} حدود ${metrics.month_revenue_rial_billions} میلیارد ریال فروش ثبت شده (${metrics.month_orders_label} سفارش) و ${metrics.month_trend}. برای اینکه ماه بعد بهتر شود، اولویت هم‌راستا «${primaryLocked.title}» است: ${primaryLocked.next_step}`
        : `در ${month} حدود ${metrics.month_revenue_rial_billions} میلیارد ریال فروش ثبت شده است.`;
      actions = enrichActions(locked, (a) => a);
      break;
    }
    case 'copy_support': {
      const all = buildMerchantActions(m);
      summary = [
        `گزارش پشتیبانی ${m.key} — ${m.category}`,
        `نرخ موفقیت ${metrics.success_rate} از ${metrics.sessions_label} جلسه.`,
        primaryLocked
          ? `اولویت: ${primaryLocked.title}. اقدام پیشنهادی: ${primaryLocked.next_step}`
          : formatActionBriefClipboard(m.key, all).split('\n').slice(0, 2).join(' '),
      ].join(' ');
      actions = enrichActions(locked, (a) => ({
        ...a,
        body: a.body,
        why: a.why || 'بر اساس الگوی ثبت‌شده در artifact پذیرنده.',
        next_step: a.next_step,
      }));
      break;
    }
    case 'chat':
      return groundedChatAnswer(locked, m);
  }

  return {
    merchant_key: locked.merchant_key,
    prompt_id: locked.prompt_id,
    summary,
    actions,
    source: 'deterministic',
  };
}

/**
 * Grounded free-chat reply from locked metrics/actions — used when OpenRouter
 * is unavailable or the model fails validation. Never invents numbers.
 */
export function groundedChatAnswer(
  locked: AiBriefLockedInput,
  m: MerchantArtifact,
): AiBriefAnswer {
  const metrics = locked.locked_metrics;
  const q = (locked.user_message ?? '').toLowerCase();
  const primary = locked.ranked_actions[0];
  const actions = locked.ranked_actions.slice(0, 3).map((a) => ({
    rank: a.rank,
    title: a.title,
    body: a.body,
    why: a.why,
    next_step: a.next_step,
    impact_phrase: a.impact_rial_billions
      ? `${a.impact_rial_billions} میلیارد ریال`
      : null,
  }));

  let summary: string;
  if (/موفق|نرخ|تبدیل|success/.test(q)) {
    summary = `نرخ موفقیت درگاه شما ${metrics.success_rate} است؛ از ${metrics.sessions_label} جلسه، ${metrics.verified_label} موفق شده‌اند. ${
      primary
        ? `اولویت هم‌راستا «${primary.title}» است: ${primary.next_step}`
        : locked.story_beats[0] ?? ''
    }`;
  } else if (/ریز|رها|بانک|قیف|drop|abandon/.test(q)) {
    summary = `ریزش را با عدد قفل ببینید: ${metrics.no_attempt_share} قبل از بانک (${metrics.no_attempt_label}) و ${metrics.in_bank_share} روی بانک (${metrics.in_bank_label}). حدود ${metrics.reached_bank_ratio} به بانک می‌رسند و ${metrics.verified_ratio} موفق می‌شوند.${
      primary ? ` کار امروز: ${primary.next_step}` : ''
    }`;
  } else if (/هم.?صنف|رقیب|peer|فاصله/.test(q)) {
    const gap = String(metrics.peer_gap);
    summary =
      gap === '0' || !m.peers || m.peers.gap <= 0
        ? copy.aiStage.peerOk
        : `فاصله با هم‌صنف‌های خوب حدود ${gap} است (مرجع خوب حدود ${metrics.peer_p75_success}). ${
            primary ? primary.body : ''
          } ${primary ? `قدم بعدی: ${primary.next_step}` : ''}`.trim();
  } else if (/ماه|فروش|درآمد|revenue|month/.test(q)) {
    const month = String(metrics.month_label || copy.aiStage.monthFallback);
    summary = `فروش ${month} حدود ${metrics.month_revenue_rial_billions} میلیارد ریال است (${metrics.month_orders_label} سفارش) و ${metrics.month_trend}.${
      primary ? ` برای رشد، روی «${primary.title}» تمرکز کنید: ${primary.next_step}` : ''
    }`;
  } else if (/قابل.?بازیابی|فرصت|recover|impact/.test(q)) {
    summary =
      String(metrics.recoverable_rial_billions) !== '0'
        ? `فرصت فروش قابل بازیابی قفل‌شده حدود ${metrics.recoverable_full || `${metrics.recoverable_rial_billions} میلیارد ریال`} است. ${
            primary ? `مسیر بستن این فرصت: ${primary.next_step}` : ''
          }`
        : `در این artifact فرصت ریالی جداگانه‌ای قفل نشده؛ روی نرخ موفقیت ${metrics.success_rate} و اقدام‌های رتبه‌دار تمرکز کنید.`;
  } else if (/مشتری|تکرار|customer|repeat/.test(q)) {
    summary =
      metrics.customers_label
        ? `حدود ${metrics.customers_label} مشتری یکتا ثبت شده` +
          (metrics.repeat_customers_label
            ? `؛ تکراری حدود ${metrics.repeat_customers_label}` +
              (metrics.repeat_order_share ? ` با سهم سفارش تکراری ${metrics.repeat_order_share}` : '')
            : '') +
          `.${primary ? ` اولویت هم‌راستا: ${primary.next_step}` : ''}`
        : `در این artifact شمارندهٔ مشتری جدا قفل نشده؛ روی نرخ موفقیت ${metrics.success_rate} تمرکز کنید.`;
  } else if (/سبد|میانه|مبلغ|ticket|price/.test(q)) {
    summary =
      metrics.avg_ticket_rial || metrics.median_ticket_rial
        ? `میانگین سبد ${metrics.avg_ticket_rial || '—'} و میانه مبلغ ${metrics.median_ticket_rial || '—'} است` +
          (metrics.unique_prices ? `؛ تعداد قیمت یکتا ${metrics.unique_prices}` : '') +
          `.${primary ? ` قدم امروز: ${primary.next_step}` : ''}`
        : `مبلغ سبد جدا در metrics قفل نشده.`;
  } else if (/کارمزد|fee|تعرفه/.test(q)) {
    summary =
      metrics.fee_actual_rate || String(metrics.fee_realized_rial_billions) !== '0'
        ? `نرخ کارمزد تحقق‌یافته حدود ${metrics.fee_actual_rate || '—'} و مبلغ تحقق‌یافته حدود ${metrics.fee_realized_rial_billions} میلیارد ریال است` +
          (metrics.fee_expected_rate ? `؛ نرخ مورد انتظار حدود ${metrics.fee_expected_rate}` : '') +
          `. تعرفهٔ محصول زرین‌پال را از این عدد استنباط نکنید.`
        : `عدد کارمزد معناداری در artifact این پذیرنده قفل نشده.`;
  } else if (/هفته|weekday|روز.?هفته/.test(q)) {
    summary = metrics.peak_weekday
      ? `اوج ترافیک هفتگی در ${metrics.peak_weekday} با حدود ${metrics.peak_weekday_sessions} جلسه است. جزئیات همهٔ روزها در merchant_dossier.series.weekdays قفل است.`
      : `سری روزهای هفته در artifact این پذیرنده خالی است.`;
  } else {
    const beat = locked.story_beats.slice(0, 2).join(' ');
    summary = primary
      ? `${beat} اولویت فعلی «${primary.title}» است. ${primary.body} قدم امروز: ${primary.next_step}`
      : beat || copy.aiStage.fallbackEmpty;
  }

  return {
    merchant_key: locked.merchant_key,
    prompt_id: 'chat',
    summary: summary.trim(),
    actions,
    source: 'deterministic',
  };
}

export function hashLocked(locked: AiBriefLockedInput): string {
  const raw = JSON.stringify(locked);
  let h = 0;
  for (let i = 0; i < raw.length; i++) h = (Math.imul(31, h) + raw.charCodeAt(i)) | 0;
  return `h${Math.abs(h).toString(36)}`;
}

export function aiBriefTrustNote(): string {
  return copy.aiStage.trust;
}

export function formatRecoverableHint(m: MerchantArtifact): string {
  if (!m.impact?.expected) return '';
  return formatBillionsRial(m.impact.expected);
}
