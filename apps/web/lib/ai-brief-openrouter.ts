/**
 * OpenRouter chat completion for rewrite-only AI brief + free chat.
 * Latency strategy: compact payload, short max_tokens, race two free models.
 */

import {
  AI_BRIEF_FALLBACK_MODEL,
  AI_BRIEF_PREFERRED_MODEL,
  AI_CHAT_PROMPT_ID,
  buildAiBriefSystemPrompt,
  buildAiBriefUserPrompt,
  validateAiBriefResponse,
  type AiBriefAnswer,
  type AiBriefLockedInput,
  type AiBriefMerchantDossier,
} from './ai-brief-prompt';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
/** Free models often queue; too-short timeout forces canned fallback and feels repetitive. */
const MODEL_TIMEOUT_MS = 14_000;

export type AiChatTurn = { role: 'user' | 'assistant'; content: string };

type OpenRouterChoice = {
  message?: { content?: string };
};

type OpenRouterResponse = {
  choices?: OpenRouterChoice[];
  error?: { message?: string };
};

/** Drop heavy daily series for recipes; keep a short window for chat. */
function compactLockedForModel(locked: AiBriefLockedInput): AiBriefLockedInput {
  const dossier = { ...locked.merchant_dossier } as AiBriefMerchantDossier;
  const seriesRaw = dossier.series;
  if (!seriesRaw || typeof seriesRaw !== 'object') {
    return { ...locked, merchant_dossier: dossier };
  }
  const series = { ...(seriesRaw as Record<string, unknown>) };
  const daily = Array.isArray(series.daily) ? series.daily : [];
  const isChat = locked.prompt_id === AI_CHAT_PROMPT_ID;
  const needsTrend =
    isChat || locked.prompt_id === 'this_month' || locked.prompt_id === 'overview';

  if (!needsTrend) {
    series.daily = [];
    series.daily_note = 'omitted_use_months_weekdays';
  } else {
    const window = isChat ? 14 : 21;
    series.daily = daily.length > window ? daily.slice(-window) : daily;
    series.daily_window = Array.isArray(series.daily) ? series.daily.length : 0;
    series.daily_note =
      daily.length > window ? `last_${window}_of_${daily.length}` : 'all';
  }

  dossier.series = series;
  return { ...locked, merchant_dossier: dossier };
}

async function callModel(
  apiKey: string,
  model: string,
  locked: AiBriefLockedInput,
  history: readonly AiChatTurn[],
  outerSignal?: AbortSignal,
): Promise<{ raw: string; model: string } | null> {
  const wire = compactLockedForModel(locked);
  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: buildAiBriefSystemPrompt(wire.prompt_id) },
  ];

  if (wire.prompt_id === AI_CHAT_PROMPT_ID) {
    const { user_message: _um, ...context } = wire;
    messages.push({
      role: 'user',
      content: `زمینهٔ قفل‌شده:\n${JSON.stringify(context)}\n\nعدد تازه نساز؛ از merchant_dossier و ranked_actions استفاده کن.`,
    });
    for (const turn of history.slice(-4)) {
      messages.push({ role: turn.role, content: turn.content });
    }
    const hasHistory = history.length > 0;
    messages.push({
      role: 'user',
      content: [
        `سؤال فعلی:\n${wire.user_message ?? ''}`,
        hasHistory
          ? 'این ادامهٔ گفتگوست: جواب قبلی را تکرار نکن. اگر «بعدش/چیکار کنم» است برو سراغ اولویت بعدی یا زاویهٔ اجرایی تازه.'
          : 'مستقیم و مشخص جواب بده؛ کلی‌گویی نکن.',
        'کلید انگلیسی JSON در متن ممنوع.',
        'فقط JSON: {"merchant_key","reply","actions"}',
      ].join('\n\n'),
    });
  } else {
    messages.push({ role: 'user', content: buildAiBriefUserPrompt(wire) });
  }

  const isChat = wire.prompt_id === AI_CHAT_PROMPT_ID;
  const timeout = AbortSignal.timeout(MODEL_TIMEOUT_MS);
  const signal =
    outerSignal && typeof AbortSignal.any === 'function'
      ? AbortSignal.any([outerSignal, timeout])
      : timeout;

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://zarinpulse.local',
      'X-Title': 'ZarinPulse AI Brief',
    },
    body: JSON.stringify({
      model,
      temperature: isChat ? 0.42 : 0.22,
      top_p: 0.9,
      max_tokens: isChat ? 700 : 1100,
      messages,
    }),
    signal,
  });
  if (!res.ok) {
    console.error('openrouter_http', model, res.status, await res.text().catch(() => ''));
    return null;
  }
  const data = (await res.json()) as OpenRouterResponse;
  if (data.error?.message) {
    console.error('openrouter_error', model, data.error.message);
    return null;
  }
  const raw = data.choices?.[0]?.message?.content;
  if (!raw || typeof raw !== 'string') return null;
  return { raw, model };
}

function isAbortError(err: unknown): boolean {
  return (
    (err instanceof Error && err.name === 'AbortError') ||
    (typeof err === 'object' &&
      err !== null &&
      'name' in err &&
      (err as { name: string }).name === 'AbortError')
  );
}

/**
 * Race preferred + fallback; first validated answer wins.
 * Cuts p50 latency when one free model is queued/slow.
 */
export async function rewriteAiBriefWithOpenRouter(
  locked: AiBriefLockedInput,
  apiKey: string,
  history: readonly AiChatTurn[] = [],
): Promise<AiBriefAnswer | null> {
  const models = [AI_BRIEF_PREFERRED_MODEL, AI_BRIEF_FALLBACK_MODEL];
  const race = new AbortController();

  const attempts = models.map(async (model) => {
    try {
      const called = await callModel(apiKey, model, locked, history, race.signal);
      if (!called) throw new Error(`empty:${model}`);
      const validated = validateAiBriefResponse(called.raw, locked);
      if (!validated.ok || !validated.value) {
        console.error('ai_brief_validate_fail', model, validated.notes);
        throw new Error(`invalid:${model}`);
      }
      return {
        ...validated.value,
        prompt_id: locked.prompt_id,
        source: 'model' as const,
        model: called.model,
      };
    } catch (err) {
      if (!isAbortError(err)) console.error('ai_brief_model_throw', model, err);
      throw err;
    }
  });

  try {
    const winner = await Promise.any(attempts);
    race.abort();
    return winner;
  } catch (err) {
    race.abort();
    if (err instanceof AggregateError) {
      console.error(
        'ai_brief_all_models_failed',
        err.errors.map((e) => (e instanceof Error ? e.message : String(e))),
      );
    }
    return null;
  }
}
