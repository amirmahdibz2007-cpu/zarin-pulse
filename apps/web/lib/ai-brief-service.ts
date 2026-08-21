/**
 * Pure-ish AI brief application service — route stays thin I/O.
 * Deterministic paths are unchanged; model is injected via deps.
 */

import { AI_CHAT_PROMPT_ID, isAiPromptId, isAiRecipeId, type AiBriefAnswer, type AiPromptId } from './ai-brief-prompt';
import type { AiChatTurn } from './ai-brief-openrouter';
import {
  aiBriefTrustNote,
  buildLockedForMerchant,
  deterministicAiBrief,
  groundedChatAnswer,
  hashLocked,
} from './ai-brief-recipes';
import type { MerchantArtifact } from './artifacts';
import { createAiBriefCache, type AiBriefCacheStore } from './ai-brief-cache';

export const AI_BRIEF_ERRORS = [
  'invalid_merchant',
  'invalid_prompt',
  'invalid_message',
  'merchant_not_found',
  'invalid_merchant_artifact',
  'ai_brief_failed',
] as const;

export type AiBriefErrorCode = (typeof AI_BRIEF_ERRORS)[number];

export type AiBriefHttpStatus = 400 | 404 | 500;

export const AI_BRIEF_ERROR_STATUS: Record<AiBriefErrorCode, AiBriefHttpStatus> = {
  invalid_merchant: 400,
  invalid_prompt: 400,
  invalid_message: 400,
  merchant_not_found: 404,
  invalid_merchant_artifact: 500,
  ai_brief_failed: 500,
};

export type AiBriefRequest = {
  merchantKey: unknown;
  promptId: unknown;
  message?: unknown;
  history?: unknown;
};

export type AiBriefOkBody = AiBriefAnswer & {
  cached: boolean;
  trust: string;
  demo: boolean;
};

export type AiBriefFailBody = {
  errorId: string;
  error: AiBriefErrorCode;
};

export type AiBriefResolveResult =
  | { ok: true; status: 200; body: AiBriefOkBody; log: AiBriefLogEvent }
  | { ok: false; status: AiBriefHttpStatus; body: AiBriefFailBody; log: AiBriefLogEvent };

export type AiBriefLogEvent = {
  errorId: string;
  merchantKey?: string;
  promptId?: string;
  source?: AiBriefAnswer['source'];
  model?: string | undefined;
  cacheHit: boolean;
  latencyMs: number;
  error?: AiBriefErrorCode;
};

export type AiBriefDeps = {
  readMerchant: (key: string) => MerchantArtifact | null;
  callModel: (
    locked: ReturnType<typeof buildLockedForMerchant>,
    apiKey: string,
    history: readonly AiChatTurn[],
  ) => Promise<AiBriefAnswer | null>;
  getApiKey: () => string | undefined;
  cache: AiBriefCacheStore;
  now: () => number;
  log?: (event: AiBriefLogEvent) => void;
};

function parseHistory(raw: unknown): AiChatTurn[] {
  if (!Array.isArray(raw)) return [];
  const out: AiChatTurn[] = [];
  for (const item of raw.slice(-6)) {
    if (!item || typeof item !== 'object') continue;
    const row = item as { role?: unknown; content?: unknown };
    if ((row.role !== 'user' && row.role !== 'assistant') || typeof row.content !== 'string') {
      continue;
    }
    const content = row.content.trim().slice(0, 1200);
    if (!content) continue;
    out.push({ role: row.role, content });
  }
  return out;
}

function fail(
  errorId: string,
  error: AiBriefErrorCode,
  started: number,
  now: () => number,
  extra: Partial<AiBriefLogEvent> = {},
): AiBriefResolveResult {
  const log: AiBriefLogEvent = {
    errorId,
    cacheHit: false,
    latencyMs: now() - started,
    error,
    ...extra,
  };
  return {
    ok: false,
    status: AI_BRIEF_ERROR_STATUS[error],
    body: { errorId, error },
    log,
  };
}

export async function resolveAiBrief(
  req: AiBriefRequest,
  deps: AiBriefDeps,
  errorId = `ai-brief-${deps.now()}`,
): Promise<AiBriefResolveResult> {
  const started = deps.now();

  if (typeof req.merchantKey !== 'string' || !/^[A-Za-z0-9_-]{1,32}$/.test(req.merchantKey)) {
    const result = fail(errorId, 'invalid_merchant', started, deps.now);
    deps.log?.(result.log);
    return result;
  }
  if (typeof req.promptId !== 'string' || !isAiPromptId(req.promptId)) {
    const result = fail(errorId, 'invalid_prompt', started, deps.now, {
      merchantKey: req.merchantKey,
    });
    deps.log?.(result.log);
    return result;
  }

  const promptId = req.promptId as AiPromptId;
  const merchantKey = req.merchantKey;
  const isChat = promptId === AI_CHAT_PROMPT_ID;

  let userMessage: string | undefined;
  if (isChat) {
    if (typeof req.message !== 'string' || req.message.trim().length === 0) {
      const result = fail(errorId, 'invalid_message', started, deps.now, {
        merchantKey,
        promptId,
      });
      deps.log?.(result.log);
      return result;
    }
    userMessage = req.message.trim().slice(0, 800);
  }

  let m: MerchantArtifact | null;
  try {
    m = deps.readMerchant(merchantKey);
  } catch {
    const result = fail(errorId, 'invalid_merchant_artifact', started, deps.now, {
      merchantKey,
      promptId,
    });
    deps.log?.(result.log);
    return result;
  }
  if (!m) {
    const result = fail(errorId, 'merchant_not_found', started, deps.now, {
      merchantKey,
      promptId,
    });
    deps.log?.(result.log);
    return result;
  }

  const locked = buildLockedForMerchant(m, promptId, userMessage);
  const history = isChat ? parseHistory(req.history) : [];
  const apiKey = deps.getApiKey()?.trim();

  if (!isChat && isAiRecipeId(promptId)) {
    const cacheKey = `${merchantKey}|${promptId}|${hashLocked(locked)}`;
    const cached = deps.cache.get(cacheKey);
    if (cached) {
      const body: AiBriefOkBody = {
        ...cached,
        cached: true,
        trust: aiBriefTrustNote(),
        demo: !apiKey,
      };
      const log: AiBriefLogEvent = {
        errorId,
        merchantKey,
        promptId,
        source: cached.source,
        model: cached.model,
        cacheHit: true,
        latencyMs: deps.now() - started,
      };
      deps.log?.(log);
      return { ok: true, status: 200, body, log };
    }
  }

  let answer: AiBriefAnswer | null = null;
  if (apiKey) {
    answer = await deps.callModel(locked, apiKey, history);
  }

  if (!answer) {
    if (isChat) {
      answer = {
        ...groundedChatAnswer(locked, m),
        source: apiKey ? 'fallback' : 'deterministic',
      };
    } else {
      answer = {
        ...deterministicAiBrief(locked, m),
        source: apiKey ? 'fallback' : 'deterministic',
      };
    }
  }

  if (!isChat && isAiRecipeId(promptId)) {
    const cacheKey = `${merchantKey}|${promptId}|${hashLocked(locked)}`;
    deps.cache.set(cacheKey, answer);
  }

  const body: AiBriefOkBody = {
    ...answer,
    cached: false,
    trust: aiBriefTrustNote(),
    demo: !apiKey,
  };
  const log: AiBriefLogEvent = {
    errorId,
    merchantKey,
    promptId,
    source: answer.source,
    model: answer.model,
    cacheHit: false,
    latencyMs: deps.now() - started,
  };
  deps.log?.(log);
  return { ok: true, status: 200, body, log };
}

const defaultCache = createAiBriefCache();

export function defaultAiBriefDeps(
  overrides: Partial<AiBriefDeps> & Pick<AiBriefDeps, 'readMerchant' | 'callModel'>,
): AiBriefDeps {
  return {
    getApiKey: () => process.env.OPENROUTER_API_KEY,
    cache: defaultCache,
    now: Date.now,
    log: (event) => {
      console.info(JSON.stringify({ scope: 'ai_brief', ...event }));
    },
    ...overrides,
  };
}
