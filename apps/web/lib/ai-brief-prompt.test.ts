import { describe, expect, it } from 'vitest';
import {
  AI_BRIEF_SYSTEM_PROMPT,
  AI_PROMPT_IDS,
  buildAiBriefLockedInput,
  isAiPromptId,
  validateAiBriefResponse,
} from './ai-brief-prompt';
import type { MerchantAction } from './merchant-actions';

const sampleActions: MerchantAction[] = [
  {
    kind: 'funnel',
    title: 'رهاشدن روی صفحه بانک را کم کنید',
    body: '۷۱٫۸٪ رها می‌شوند؛ حدود ۸۳٫۷۵ میلیارد ریال قابل بازیابی است.',
    why: 'مشتری آماده‌اند.',
    nextStep: 'صفحه پرداخت را ساده کنید.',
    evidence: '',
    impactRial: 83_750_000_000,
  },
  {
    kind: 'peer',
    title: 'فاصله با هم‌صنف را کم کنید',
    body: 'شکاف موفقیت ۱۲٪ است.',
    why: 'هم‌صنف‌های خوب بهتر تبدیل می‌کنند.',
    nextStep: 'قیف را با الگوی موفق هم‌صنف هم‌تراز کنید.',
    evidence: '',
    impactRial: 10_000_000_000,
  },
];

describe('ai-brief-prompt', () => {
  it('locks red lines into the system prompt', () => {
    expect(AI_BRIEF_SYSTEM_PROMPT).toContain('خط قرمز');
    expect(AI_BRIEF_SYSTEM_PROMPT).toContain('هیچ عدد');
    expect(AI_BRIEF_SYSTEM_PROMPT).toContain('ترتیب اولویت');
  });

  it('exposes the ready prompt catalog', () => {
    expect(AI_PROMPT_IDS).toContain('overview');
    expect(isAiPromptId('grow_sales')).toBe(true);
    expect(isAiPromptId('free_chat')).toBe(false);
  });

  it('accepts a compliant rewrite', () => {
    const locked = buildAiBriefLockedInput({
      key: 'M31',
      promptId: 'overview',
      category: 'مراکز آموزشی مجازی',
      metrics: { sessions: 1 },
      actions: sampleActions,
      impactBillionsByIndex: ['۸۳٫۷۵', '۱۰'],
    });
    const raw = JSON.stringify({
      merchant_key: 'M31',
      summary: 'رهاشدن روی بانک حدود ۸۳٫۷۵ میلیارد ریال فرصت است.',
      actions: [
        {
          rank: 1,
          title: sampleActions[0]!.title,
          body: 'بیشتر مشتری‌ها روی بانک انصراف می‌دهند؛ حدود ۸۳٫۷۵ میلیارد ریال قابل بازیابی است.',
          why: 'مشتری آماده‌اند و وسط راه پشیمان می‌شوند.',
          next_step: 'پیام خطا و مبلغ را ساده‌تر کنید.',
          impact_phrase: '۸۳٫۷۵ میلیارد ریال',
        },
        {
          rank: 2,
          title: sampleActions[1]!.title,
          body: 'شکاف موفقیت ۱۲٪ است و باید بسته شود.',
          why: 'هم‌صنف‌های خوب بهتر تبدیل می‌کنند.',
          next_step: 'قیف را با الگوی موفق هم‌صنف هم‌تراز کنید.',
          impact_phrase: '۱۰ میلیارد ریال',
        },
      ],
    });
    const v = validateAiBriefResponse(raw, locked);
    expect(v.ok).toBe(true);
    expect(v.notes.filter((n) => n !== 'summary_weak_rank1_echo')).toEqual([]);
  });

  it('repairs drifted titles onto locked titles', () => {
    const locked = buildAiBriefLockedInput({
      key: 'M31',
      promptId: 'overview',
      category: 'x',
      metrics: { success_rate: '۲۰٪' },
      actions: sampleActions.slice(0, 1),
    });
    const raw = JSON.stringify({
      merchant_key: 'M31',
      summary: 'رهاشدن روی بانک اولویت است و نرخ ۲۰٪ را تحت فشار می‌گذارد.',
      actions: [
        {
          rank: 1,
          title: 'عنوان جعلی',
          body: 'بدنه قابل قبول برای فروش',
          why: 'چرا مهم است',
          next_step: 'قدم اجرایی امروز',
          impact_phrase: null,
        },
      ],
    });
    const v = validateAiBriefResponse(raw, locked);
    expect(v.ok).toBe(true);
    expect(v.value?.actions[0]?.title).toBe(sampleActions[0]!.title);
  });

  it('rejects empty body even after title drift', () => {
    const locked = buildAiBriefLockedInput({
      key: 'M31',
      promptId: 'overview',
      category: 'x',
      metrics: {},
      actions: sampleActions.slice(0, 1),
    });
    const raw = JSON.stringify({
      merchant_key: 'M31',
      summary: 'خلاصه',
      actions: [
        {
          rank: 1,
          title: 'عنوان جعلی',
          body: '',
          why: 'چرا',
          next_step: '',
          impact_phrase: null,
        },
      ],
    });
    const v = validateAiBriefResponse(raw, locked);
    expect(v.ok).toBe(false);
  });

  it('rejects markdown fences and forbidden tokens', () => {
    const locked = buildAiBriefLockedInput({
      key: 'M31',
      promptId: 'overview',
      category: 'x',
      metrics: {},
      actions: sampleActions.slice(0, 1),
    });
    const inner = {
      merchant_key: 'M31',
      summary: 'خلاصه با KPI جعلی',
      actions: [
        {
          rank: 1,
          title: sampleActions[0]!.title,
          body: 'بدنه',
          why: 'چرا',
          next_step: 'قدم',
          impact_phrase: null,
        },
      ],
    };
    const v = validateAiBriefResponse(`\`\`\`json\n${JSON.stringify(inner)}\n\`\`\``, locked);
    expect(v.ok).toBe(false);
    expect(v.notes.some((n) => n.startsWith('forbidden:'))).toBe(true);
  });

  it('focuses grow_sales on rank-1 only', () => {
    const locked = buildAiBriefLockedInput({
      key: 'M31',
      promptId: 'grow_sales',
      category: 'x',
      metrics: {},
      actions: sampleActions,
    });
    expect(locked.ranked_actions).toHaveLength(1);
    expect(locked.ranked_actions[0]?.title).toBe(sampleActions[0]!.title);
  });

  it('focuses peer_gap on peer action when present', () => {
    const locked = buildAiBriefLockedInput({
      key: 'M31',
      promptId: 'peer_gap',
      category: 'x',
      metrics: { peer_gap: '۱۲٪' },
      actions: sampleActions,
    });
    expect(locked.ranked_actions).toHaveLength(1);
    expect(locked.ranked_actions[0]?.kind).toBe('peer');
  });

  it('accepts grounded chat reply without canned template shape', () => {
    const locked = buildAiBriefLockedInput({
      key: 'M31',
      promptId: 'chat',
      category: 'x',
      metrics: { success_rate: '۲۰٪', sessions: 1000 },
      actions: sampleActions,
      userMessage: 'نرخ موفقیتم چقدر است؟',
    });
    const raw = JSON.stringify({
      merchant_key: 'M31',
      reply: 'طبق داده قفل، نرخ موفقیت ۲۰٪ از ۱۰۰۰ جلسه است.',
      actions: [],
    });
    const v = validateAiBriefResponse(raw, locked);
    expect(v.ok).toBe(true);
    expect(v.value?.summary).toContain('۲۰٪');
  });

  it('rejects chat reply that invents a number', () => {
    const locked = buildAiBriefLockedInput({
      key: 'M31',
      promptId: 'chat',
      category: 'x',
      metrics: { success_rate: '۲۰٪' },
      actions: sampleActions.slice(0, 1),
      userMessage: 'چطورم؟',
    });
    const raw = JSON.stringify({
      merchant_key: 'M31',
      reply: 'نرخ شما ۹۹٪ است.',
      actions: [],
    });
    const v = validateAiBriefResponse(raw, locked);
    expect(v.ok).toBe(false);
    expect(v.notes).toContain('invented_number');
  });

  it('scrubs forbidden jargon in chat and skips bad action rows', () => {
    const locked = buildAiBriefLockedInput({
      key: 'M31',
      promptId: 'chat',
      category: 'x',
      metrics: { success_rate: '۲۰٪', sessions: 1000 },
      actions: sampleActions,
      userMessage: 'وضعیت؟',
    });
    const raw = JSON.stringify({
      merchant_key: 'M31',
      reply: 'نرخ موفقیت ۲۰٪ است؛ مسیر PSP را چک کنید.',
      actions: [{ rank: 1 }, { title: sampleActions[0]!.title, body: 'ok' }],
    });
    const v = validateAiBriefResponse(raw, locked);
    expect(v.ok).toBe(true);
    expect(v.value?.summary).toContain('۲۰٪');
    expect(v.value?.summary.includes('PSP')).toBe(false);
    expect(v.value?.actions).toHaveLength(1);
    expect(v.value?.actions[0]?.title).toBe(sampleActions[0]!.title);
  });

  it('scrubs English field leaks from chat replies', () => {
    const locked = buildAiBriefLockedInput({
      key: 'M31',
      promptId: 'chat',
      category: 'x',
      metrics: { success_rate: '۲۰٪', paid_pending: 0 },
      actions: sampleActions.slice(0, 1),
      userMessage: 'پول معلق؟',
    });
    const raw = JSON.stringify({
      merchant_key: 'M31',
      reply: 'پول معلق (paid_pending) صفر است و نرخ ۲۰٪.',
      actions: [],
    });
    const v = validateAiBriefResponse(raw, locked);
    expect(v.ok).toBe(true);
    expect(v.value?.summary.includes('paid_pending')).toBe(false);
    expect(v.value?.summary).toContain('۲۰٪');
  });

  it('rejects chat that confuses pending money with recoverable impact', () => {
    const locked = buildAiBriefLockedInput({
      key: 'M31',
      promptId: 'chat',
      category: 'x',
      metrics: {
        success_rate: '۱۹٫۶٪',
        paid_pending: 0,
        pending_rial_billions: '0',
        recoverable_rial_billions: '۸۳٫۷۵',
      },
      actions: sampleActions.slice(0, 1),
      userMessage: 'پول معلقم چقدر است؟',
    });
    const raw = JSON.stringify({
      merchant_key: 'M31',
      reply: 'پول معلق روی بانک حدود ۸۳٫۷۵ میلیارد ریال است.',
      actions: [],
    });
    const v = validateAiBriefResponse(raw, locked);
    expect(v.ok).toBe(false);
    expect(v.notes).toContain('pending_confused_with_recoverable');
  });
});
