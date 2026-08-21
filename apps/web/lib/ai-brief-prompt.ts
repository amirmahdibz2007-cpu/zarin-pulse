/**
 * AI brief = grounded rewrite / chat over buildMerchantActions() + locked metrics.
 * Model must not invent metrics or reorder priorities — but must write like a sharp merchant advisor.
 */

import type { MerchantAction } from './merchant-actions';

export const AI_BRIEF_FORBIDDEN_TOKENS = [
  'صدک',
  'بوت‌استرپ',
  'بوت استرپ',
  'بازه اطمینان',
  'p-value',
  'Wilson',
  'KPI',
  'funnel',
  'AOV',
  'PSP',
] as const;

/** English JSON keys that must never appear in user-facing Persian prose. */
export const AI_BRIEF_PROSE_SCRUB_TOKENS = [
  'paid_pending',
  'success_rate',
  'in_bank',
  'no_attempt',
  'merchant_dossier',
  'ranked_actions',
  'story_beats',
  'locked_metrics',
  'impact_rial',
] as const;

/** Ready chips only (not free chat). */
export const AI_PROMPT_IDS = [
  'overview',
  'grow_sales',
  'why_drop',
  'peer_gap',
  'this_month',
  'copy_support',
] as const;

export type AiRecipeId = (typeof AI_PROMPT_IDS)[number];

/** Free chat — model-only, no deterministic template. */
export const AI_CHAT_PROMPT_ID = 'chat' as const;

export type AiPromptId = AiRecipeId | typeof AI_CHAT_PROMPT_ID;

export function isAiRecipeId(value: string): value is AiRecipeId {
  return (AI_PROMPT_IDS as readonly string[]).includes(value);
}

export function isAiPromptId(value: string): value is AiPromptId {
  return isAiRecipeId(value) || value === AI_CHAT_PROMPT_ID;
}

const QUALITY_VOICE = `===== لحن =====
مثل مشاور باتجربهٔ درگاه حرف بزن: طبیعی، دقیق، بدون شعار و ترجمه‌ی ماشینی.
عدد قفل را داخل جمله بیاور؛ طول جواب را با سؤال هماهنگ کن (سلام کوتاه، سؤال تحلیلی عمیق‌تر).`;

/** System prompt with absolute product red lines (Persian). */
export const AI_BRIEF_SYSTEM_PROMPT = `نقش تو: مشاور کسب‌وکار «زرین‌پالس» برای همین پذیرنده.
تشخیص و اولویت از ranked_actions قفل‌اند؛ اعداد و واقعیت‌ها از locked_metrics و merchant_dossier (تمام دادهٔ موجود همین پذیرنده) می‌آیند.

===== خط قرمز (نقض = شکست) =====
1) هیچ عدد، درصد، مبلغ، رتبه یا شمارنده‌ای نساز و حساب نکن. فقط از JSON ورودی (locked_metrics / merchant_dossier / ranked_actions / story_beats).
2) ترتیب اولویت (rank) را عوض نکن. عنوان (title) را عوض نکن.
3) علیت قطعی نگو («قطعاً»، «حتماً»، «باگ بانک»). بگو «الگوی داده نشان می‌دهد» یا «به‌نظر می‌رسد».
4) تعرفه واقعی زرین‌پال، توصیهٔ حقوقی، و نام ابزار فنی نگو.
5) واژه‌های ممنوع: صدک، بوت‌استرپ، بازه اطمینان، p-value، Wilson، KPI، funnel، AOV، PSP.
6) اگر ورودی ناقص بود فقط {"error":"incomplete_input"} برگردان.
7) JSON را کامل ببند؛ بدون markdown.
8) از series داخل merchant_dossier (ماه‌ها، روزهای هفته، روزانه) فقط برای روایت روند همین پذیرنده استفاده کن؛ جمع/میانگین تازه حساب نکن.

${QUALITY_VOICE}

===== خروجی =====
فقط یک JSON معتبر:
{
  "merchant_key": "...",
  "summary": "۳ تا ۵ جملهٔ قوی؛ داستان کوتاه وضعیت + اولویت rank=1 + اثر ریالی اگر هست",
  "actions": [
    {
      "rank": 1,
      "title": "همان title ورودی",
      "body": "۱–۲ جمله؛ معنی مشکل برای فروش این پذیرنده",
      "why": "۱ جمله؛ چرا الان مهم است",
      "next_step": "۱ جملهٔ اجرایی برای امروز (چه کسی / چه کاری / کجا)",
      "impact_phrase": "اگر impact_rial_billions بود همان رقم + «میلیارد ریال»؛ وگرنه null"
    }
  ]
}
تعداد actions باید دقیقاً برابر ranked_actions باشد.`;

export const AI_PROMPT_SYSTEM_EXTRA: Record<AiRecipeId, string> = {
  overview: `recipe=overview:
summary را مثل بریف صبحگاهی مدیر بنویس: اول بزرگ‌ترین سوراخ (rank=1) با عدد، بعد فرصت ریالی قفل، بعد اشاره کوتاه به اقدام‌های بعدی بدون جابه‌جایی اولویت.
هر action را طوری بازنویسی کن که پذیرنده بفهمد «اگر این را درست کنم چه می‌شود».`,
  grow_sales: `recipe=grow_sales:
فقط رشد فروش از مسیر rank=1. بازاریابی کلی، اینستاگرام، یا کانال جدید پیشنهاد نده.
summary باید next_step را روشن کند و اگر impact هست اثر ریالی را بگوید.`,
  why_drop: `recipe=why_drop:
با شمارنده‌های locked_metrics مسیر مشتری را روایت کن: باز شدن → نرسیدن به بانک → رهاشدن روی بانک → موفق.
عددها را زنجیره کن تا مشخص شود کجا بیشترین ریزش است. تشخیص جدید نساز.`,
  peer_gap: `recipe=peer_gap:
فقط فاصلهٔ هم‌صنف از peer_gap / peer_p75_success و اقدام peer. اگر gap صفر یا منفی است صادق باش و روی حفظ نرخ تمرکز کن.`,
  this_month: `recipe=this_month:
فروش ماه (month_label + month_revenue) را معنی کن؛ اگر story_beats روند ماه دارد از همان استفاده کن؛ بعد یک توصیه هم‌راستا با rank=1 بده.`,
  copy_support: `recipe=copy_support:
لحن رسمی پشتیبانی داخلی: خلاصه برای تیکت. اعداد و title ثابت؛ مناسب کپی به همکار پشتیبانی.`,
};

/**
 * Free chat: real model + full merchant data.
 * Prefer natural helpful answers over rigid recipe templates.
 */
export const AI_CHAT_SYSTEM_PROMPT = `تو تحلیل‌گر زرین‌پالس برای همین پذیرنده هستی.
دادهٔ کامل پذیرنده را در JSON قفل‌شده داری (locked_metrics، merchant_dossier، ranked_actions، story_beats).
از این داده مثل یک هوش مصنوعی قوی که داشبورد را دیده استفاده کن؛ بهتر و دقیق‌تر از چت عمومی جواب بده چون عددها را داری.

قیدهای سخت (فقط این‌ها):
- عدد تازه نساز و جمع/میانگین اختراع نکن؛ فقط از همان JSON.
- عنوان/ترتیب اولویت ranked_actions را عوض نکن.
- علیت قطعی، تعرفهٔ واقعی زرین‌پال، و توصیهٔ حقوقی نگو.
- کلید انگلیسی JSON را در متن فارسی ننویس.
- «پول معلق» را با «فرصت قابل‌بازیابی» قاطی نکن.

رفتار گفتگو:
- به همان چیزی جواب بده که کاربر پرسیده؛ اندازهٔ جواب را با سؤال هماهنگ کن.
- اگر فقط سلام/احوال‌پرسی است، کوتاه سلام کن و بپرس روی چه چیزی کمک می‌خواهد — گزارش کامل و کارت اقدام نریز.
- اگر سؤال تحلیلی است، عمیق و مشخص باش و از داده استفاده کن.
- اگر خارج از داده بود صادق باش؛ می‌توانی با دادهٔ درگاه پل بزنی بدون اینکه وانمود کنی همه‌چیز را می‌دانی.
- تاریخچه را در نظر بگیر؛ طوطی‌وار تکرار نکن.

${QUALITY_VOICE}

خروجی فقط JSON بدون markdown:
{"merchant_key":"...","reply":"...","actions":[]}
actions را فقط وقتی پر کن که واقعاً به اقدام مربوط است؛ وگرنه [].
حداکثر ۳ action با همان titleهای ranked_actions.`;

export type AiBriefLockedAction = {
  rank: number;
  kind: string;
  title: string;
  body: string;
  why: string;
  next_step: string;
  impact_rial_billions: string | null;
};

/** Full merchant facts for grounded Q&A — model may read, never invent. */
export type AiBriefMerchantDossier = Record<string, unknown>;

export type AiBriefLockedInput = {
  merchant_key: string;
  prompt_id: AiPromptId;
  category: string;
  locked_metrics: Record<string, string | number>;
  /** Every artifact field available for this merchant (series + scalars). */
  merchant_dossier: AiBriefMerchantDossier;
  /** Precomputed Persian story lines the model must weave — not invent. */
  story_beats: string[];
  ranked_actions: AiBriefLockedAction[];
  rewrite_instruction: string;
  /** Free-chat user message (chat only). */
  user_message?: string;
};

export type AiBriefModelAction = {
  rank: number;
  title: string;
  body: string;
  why: string;
  next_step: string;
  impact_phrase: string | null;
};

export type AiBriefModelOutput = {
  merchant_key: string;
  summary: string;
  actions: AiBriefModelAction[];
};

export type AiBriefAnswer = AiBriefModelOutput & {
  prompt_id: AiPromptId;
  source: 'model' | 'deterministic' | 'fallback';
  model?: string;
};

export function buildAiBriefLockedInput(input: {
  key: string;
  promptId: AiPromptId;
  category: string;
  metrics: Record<string, string | number>;
  dossier?: AiBriefMerchantDossier;
  storyBeats?: readonly string[];
  actions: readonly MerchantAction[];
  impactBillionsByIndex?: readonly (string | null)[];
  userMessage?: string;
}): AiBriefLockedInput {
  const focused = focusActionsForPrompt(input.promptId, input.actions);
  const primary = focused[0] ?? input.actions[0];
  return {
    merchant_key: input.key,
    prompt_id: input.promptId,
    category: input.category,
    locked_metrics: input.metrics,
    merchant_dossier: input.dossier ?? {},
    story_beats: [...(input.storyBeats ?? [])],
    ranked_actions: focused.map((a, i) => {
      const origIdx = input.actions.indexOf(a);
      return {
        rank: i + 1,
        kind: a.kind,
        title: a.title,
        body: a.body,
        why: a.why,
        next_step: a.nextStep,
        impact_rial_billions:
          origIdx >= 0 ? (input.impactBillionsByIndex?.[origIdx] ?? null) : null,
      };
    }),
    rewrite_instruction: buildRewriteInstruction(input.promptId, primary?.title),
    ...(input.userMessage ? { user_message: input.userMessage } : {}),
  };
}

function focusActionsForPrompt(
  promptId: AiPromptId,
  actions: readonly MerchantAction[],
): MerchantAction[] {
  if (promptId === AI_CHAT_PROMPT_ID) return [...actions];
  if (promptId === 'peer_gap') {
    const peer = actions.filter((a) => a.kind === 'peer');
    return peer.length > 0 ? peer : actions.slice(0, 1);
  }
  if (promptId === 'grow_sales') {
    return actions.slice(0, 1);
  }
  return [...actions];
}

function buildRewriteInstruction(promptId: AiPromptId, primaryTitle?: string): string {
  if (promptId === AI_CHAT_PROMPT_ID) {
    return 'با دادهٔ قفل جواب بده؛ لحن طبیعی؛ اندازهٔ جواب با سؤال یکی باشد.';
  }
  const titleBit = primaryTitle ? ` («${primaryTitle}»)` : '';
  switch (promptId) {
    case 'overview':
      return `بریف صبحگاهی بنویس. مشکل اصلی rank=1 است${titleBit}. اولویت را عوض نکن.`;
    case 'grow_sales':
      return `روی next_step و اثر ریالی rank=1 تمرکز کن${titleBit}.`;
    case 'why_drop':
      return 'ریزش قیف را با شمارنده‌های قفل روایت کن.';
    case 'peer_gap':
      return 'فقط فاصلهٔ هم‌صنف قفل‌شده؛ اگر gap≤0 صادق باش.';
    case 'this_month':
      return `معنی ماه را با عدد قفل بگو و به rank=1${titleBit} وصل کن.`;
    case 'copy_support':
      return 'لحن رسمی پشتیبانی؛ معنی و اعداد ثابت.';
  }
}

export function buildAiBriefUserPrompt(locked: AiBriefLockedInput): string {
  if (locked.prompt_id === AI_CHAT_PROMPT_ID) {
    const { user_message: _um, ...context } = locked;
    return `زمینهٔ قفل‌شده (JSON):\n${JSON.stringify(context)}\n\nسؤال کاربر:\n${locked.user_message ?? ''}`;
  }
  const recipe = locked.prompt_id as AiRecipeId;
  return `prompt_id=${recipe}\n${AI_PROMPT_SYSTEM_EXTRA[recipe]}\n\nstory_beats را در summary بباف؛ عدد تازه نساز.\n\nورودی قفل‌شده (JSON):\n${JSON.stringify(locked)}`;
}

export function buildAiBriefSystemPrompt(promptId: AiPromptId): string {
  if (promptId === AI_CHAT_PROMPT_ID) return AI_CHAT_SYSTEM_PROMPT;
  return `${AI_BRIEF_SYSTEM_PROMPT}\n\n===== recipe =====\n${AI_PROMPT_SYSTEM_EXTRA[promptId]}`;
}

export type AiBriefValidation = {
  ok: boolean;
  notes: string[];
  value: AiBriefModelOutput | null;
};

function stripFences(raw: string): string {
  return raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();
}

function hasDigit(text: string): boolean {
  return /[0-9۰-۹]/.test(text);
}

function digitRuns(text: string): string[] {
  const normalized = text
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
  return normalized.match(/\d+(?:\.\d+)?/g) ?? [];
}

function replyUsesOnlyLockedDigits(reply: string, locked: AiBriefLockedInput): boolean {
  const allowed = new Set(digitRuns(JSON.stringify(locked)));
  for (let i = 0; i <= 9; i++) allowed.add(String(i));
  for (const run of digitRuns(reply)) {
    if (!allowed.has(run)) return false;
  }
  return true;
}

function parseJsonObject(raw: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(stripFences(raw)) as unknown;
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

function scrubForbiddenTokens(text: string): string {
  let out = text;
  for (const tok of AI_BRIEF_FORBIDDEN_TOKENS) {
    if (out.includes(tok)) out = out.split(tok).join('');
  }
  for (const tok of AI_BRIEF_PROSE_SCRUB_TOKENS) {
    if (out.includes(tok)) out = out.split(tok).join('');
  }
  // Drop snake_case JSON keys the model sometimes leaks into Persian prose.
  out = out.replace(/\s*\([a-z][a-zA-Z0-9_]{2,}\)/g, '');
  out = out.replace(/\b[a-z]+(?:_[a-z0-9]+)+\b/gi, '');
  return out.replace(/\s{2,}/g, ' ').replace(/\s+([،.؛:])/g, '$1').trim();
}

function confusesPendingWithRecoverable(
  reply: string,
  locked: AiBriefLockedInput,
  userMessage: string,
): boolean {
  if (!/معلق|pending/i.test(userMessage)) return false;
  const pendingZero =
    String(locked.locked_metrics.pending_rial_billions ?? '0') === '0' &&
    Number(locked.locked_metrics.paid_pending ?? 0) === 0;
  if (!pendingZero) return false;
  const recoverable = String(locked.locked_metrics.recoverable_rial_billions ?? '0');
  if (recoverable !== '0' && reply.includes(recoverable)) return true;
  // Claims a non-zero pending money without saying صفر/۰
  if (/پول\s*معلق/.test(reply) && /میلیارد/.test(reply) && !/(?:صفر|۰)/.test(reply)) return true;
  return false;
}

export function validateAiChatResponse(
  raw: string,
  locked: AiBriefLockedInput,
): AiBriefValidation {
  const notes: string[] = [];
  const obj = parseJsonObject(raw);
  if (!obj) return { ok: false, notes: ['invalid_json'], value: null };
  if (obj.error) return { ok: false, notes: ['model_error'], value: null };
  if (obj.merchant_key !== locked.merchant_key) {
    return { ok: false, notes: ['wrong_merchant_key'], value: null };
  }

  let reply =
    typeof obj.reply === 'string'
      ? obj.reply
      : typeof obj.summary === 'string'
        ? obj.summary
        : '';
  if (!reply.trim()) return { ok: false, notes: ['missing_reply'], value: null };
  if (reply.trim().length > 1200) notes.push('reply_too_long');

  reply = scrubForbiddenTokens(reply);
  if (!reply) return { ok: false, notes: ['empty_after_scrub'], value: null };

  if (!replyUsesOnlyLockedDigits(reply, locked)) {
    notes.push('invented_number');
  }

  const actions: AiBriefModelAction[] = [];
  if (Array.isArray(obj.actions)) {
    const byTitle = new Map(locked.ranked_actions.map((a) => [a.title, a]));
    for (const item of obj.actions.slice(0, locked.ranked_actions.length)) {
      if (!item || typeof item !== 'object') continue;
      const got = item as Record<string, unknown>;
      if (typeof got.title !== 'string') continue;
      const want = byTitle.get(got.title);
      if (!want) continue;
      actions.push({
        rank: want.rank,
        title: want.title,
        body: scrubForbiddenTokens(String(got.body ?? want.body)),
        why: scrubForbiddenTokens(String(got.why ?? want.why)),
        next_step: scrubForbiddenTokens(String(got.next_step ?? want.next_step)),
        impact_phrase:
          got.impact_phrase === null || got.impact_phrase === undefined
            ? want.impact_rial_billions
              ? `${want.impact_rial_billions} میلیارد ریال`
              : null
            : scrubForbiddenTokens(String(got.impact_phrase)),
      });
      if (actions.length >= 3) break;
    }
  }

  if (/۱۶۳.?۳۳۴|163334/.test(reply)) notes.push('hallucinated_derived_count');

  const q = locked.user_message ?? '';
  if (confusesPendingWithRecoverable(reply, locked, q)) {
    return { ok: false, notes: ['pending_confused_with_recoverable'], value: null };
  }

  const fatal = notes.filter((n) => n === 'invented_number' || n === 'reply_too_long' || n === 'hallucinated_derived_count');
  if (fatal.length > 0) {
    return { ok: false, notes: fatal, value: null };
  }

  return {
    ok: true,
    notes,
    value: {
      merchant_key: locked.merchant_key,
      summary: reply.trim(),
      actions,
    },
  };
}

/**
 * If model is close but titles drifted, repair onto locked titles by index.
 * Returns null when JSON is unusable.
 */
export function tryRepairAiBriefResponse(
  raw: string,
  locked: AiBriefLockedInput,
): AiBriefModelOutput | null {
  const obj = parseJsonObject(raw);
  if (!obj || obj.error) return null;
  if (obj.merchant_key !== locked.merchant_key) return null;

  const summary =
    typeof obj.summary === 'string'
      ? obj.summary.trim()
      : typeof obj.reply === 'string'
        ? obj.reply.trim()
        : '';
  if (!summary || summary.length > 1200) return null;

  const blob = JSON.stringify(obj);
  for (const tok of AI_BRIEF_FORBIDDEN_TOKENS) {
    if (blob.includes(tok)) return null;
  }
  if (/۱۶۳.?۳۳۴|163334/.test(blob)) return null;
  if (!replyUsesOnlyLockedDigits(summary, locked)) return null;

  if (!Array.isArray(obj.actions)) return null;
  if (obj.actions.length !== locked.ranked_actions.length) return null;

  const actions: AiBriefModelAction[] = [];
  for (let i = 0; i < locked.ranked_actions.length; i++) {
    const want = locked.ranked_actions[i]!;
    const got = obj.actions[i] as Record<string, unknown> | undefined;
    if (!got) return null;
    const body = typeof got.body === 'string' ? got.body.trim() : '';
    const why = typeof got.why === 'string' ? got.why.trim() : want.why;
    const next = typeof got.next_step === 'string' ? got.next_step.trim() : '';
    if (!body || !next) return null;
    actions.push({
      rank: want.rank,
      title: want.title,
      body,
      why: why || want.why,
      next_step: next,
      impact_phrase:
        got.impact_phrase === null || got.impact_phrase === undefined
          ? want.impact_rial_billions
            ? `${want.impact_rial_billions} میلیارد ریال`
            : null
          : String(got.impact_phrase),
    });
  }

  return { merchant_key: locked.merchant_key, summary, actions };
}

export function validateAiBriefResponse(
  raw: string,
  locked: AiBriefLockedInput,
): AiBriefValidation {
  if (locked.prompt_id === AI_CHAT_PROMPT_ID) {
    const chat = validateAiChatResponse(raw, locked);
    if (chat.ok) return chat;
    const repaired = tryRepairAiBriefResponse(raw, locked);
    if (repaired) {
      return { ok: true, notes: ['repaired_chat'], value: repaired };
    }
    return chat;
  }

  const notes: string[] = [];
  const obj = parseJsonObject(raw);
  if (!obj) return { ok: false, notes: ['invalid_json'], value: null };
  if (obj.error) return { ok: false, notes: ['model_error'], value: null };
  if (obj.merchant_key !== locked.merchant_key) notes.push('wrong_merchant_key');
  if (typeof obj.summary !== 'string' || obj.summary.trim().length === 0) {
    notes.push('missing_summary');
  } else if (obj.summary.trim().length > 900) {
    notes.push('summary_too_long');
  }

  if (!Array.isArray(obj.actions)) {
    notes.push('actions_not_array');
    const repairedEarly = tryRepairAiBriefResponse(raw, locked);
    if (repairedEarly) return { ok: true, notes: ['repaired'], value: repairedEarly };
    return { ok: false, notes, value: null };
  }
  if (obj.actions.length !== locked.ranked_actions.length) {
    notes.push('action_count_mismatch');
  }

  const actions: AiBriefModelAction[] = [];
  for (let i = 0; i < locked.ranked_actions.length; i++) {
    const want = locked.ranked_actions[i]!;
    const got = obj.actions[i] as Record<string, unknown> | undefined;
    if (!got) {
      notes.push(`missing_action_${i}`);
      continue;
    }
    if (got.rank !== want.rank) notes.push(`rank_changed_${i}`);
    if (got.title !== want.title) notes.push(`title_changed_${i}`);
    if (typeof got.body !== 'string' || !got.body.trim()) notes.push(`body_empty_${i}`);
    if (typeof got.why !== 'string') notes.push(`why_missing_${i}`);
    if (typeof got.next_step !== 'string' || !got.next_step.trim()) notes.push(`next_empty_${i}`);

    const impactPhrase =
      got.impact_phrase === null || got.impact_phrase === undefined
        ? null
        : String(got.impact_phrase);
    if (want.impact_rial_billions && impactPhrase) {
      if (
        !impactPhrase.includes(want.impact_rial_billions) &&
        !hasDigit(impactPhrase)
      ) {
        notes.push(`impact_missing_digit_${i}`);
      }
    }

    actions.push({
      rank: want.rank,
      title: want.title,
      body: String(got.body ?? ''),
      why: String(got.why ?? ''),
      next_step: String(got.next_step ?? ''),
      impact_phrase: impactPhrase,
    });
  }

  const blob = JSON.stringify(obj);
  for (const tok of AI_BRIEF_FORBIDDEN_TOKENS) {
    if (blob.includes(tok)) notes.push(`forbidden:${tok}`);
  }
  if (/۱۶۳.?۳۳۴|163334/.test(blob)) notes.push('hallucinated_derived_count');

  const hardNotes = notes.filter(
    (n) => n !== 'summary_weak_rank1_echo' && !n.startsWith('title_changed_'),
  );

  if (hardNotes.length === 0 && notes.some((n) => n.startsWith('title_changed_'))) {
    const repaired = tryRepairAiBriefResponse(raw, locked);
    if (repaired) return { ok: true, notes: ['repaired_titles'], value: repaired };
  }

  if (hardNotes.length > 0) {
    const repaired = tryRepairAiBriefResponse(raw, locked);
    if (repaired) return { ok: true, notes: ['repaired', ...hardNotes], value: repaired };
  }

  const value: AiBriefModelOutput = {
    merchant_key: locked.merchant_key,
    summary: String(obj.summary ?? ''),
    actions,
  };
  return { ok: hardNotes.length === 0, notes, value };
}

/** Preferred OpenRouter model after rewrite-only eval (see prompt bakeoff). */
/** Latency-first free model; heavier model is parallel fallback. */
export const AI_BRIEF_PREFERRED_MODEL = 'poolside/laguna-s-2.1:free';
export const AI_BRIEF_FALLBACK_MODEL = 'nvidia/nemotron-3-ultra-550b-a55b:free';
