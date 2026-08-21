'use client';

import { copy } from '@zarinpulse/contracts';
import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import {
  AI_CHAT_PROMPT_ID,
  AI_PROMPT_IDS,
  type AiBriefAnswer,
  type AiRecipeId,
} from '../lib/ai-brief-prompt';

type StageStatus = 'boot' | 'ready' | 'thinking' | 'ok' | 'error';

type ApiOk = AiBriefAnswer & {
  trust?: string;
  demo?: boolean;
  cached?: boolean;
  error?: string;
};

type ChatMsg = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  actions?: AiBriefAnswer['actions'];
  source?: AiBriefAnswer['source'];
  /** Type out content when true (assistant only). */
  animate?: boolean;
};

function uid(): string {
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function formatAssistantMessage(data: ApiOk): string {
  return (data.summary ?? '').trim();
}

function sourceLabel(source: AiBriefAnswer['source'] | undefined): string {
  if (source === 'model') return copy.aiStage.sourceModel;
  if (source === 'fallback') return copy.aiStage.sourceFallback;
  if (source === 'deterministic') return copy.aiStage.sourceDeterministic;
  return '';
}

function preferReducedMotion(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function TypewriterBody(props: {
  text: string;
  active: boolean;
  onDone: () => void;
}) {
  const [shown, setShown] = useState(props.active ? '' : props.text);
  const doneRef = useRef(false);

  useEffect(() => {
    doneRef.current = false;
    if (!props.active || preferReducedMotion()) {
      setShown(props.text);
      if (!doneRef.current) {
        doneRef.current = true;
        props.onDone();
      }
      return;
    }
    setShown('');
    let i = 0;
    const step = Math.max(1, Math.ceil(props.text.length / 50));
    const id = window.setInterval(() => {
      i = Math.min(props.text.length, i + step);
      setShown(props.text.slice(0, i));
      if (i >= props.text.length) {
        window.clearInterval(id);
        if (!doneRef.current) {
          doneRef.current = true;
          props.onDone();
        }
      }
    }, 16);
    return () => window.clearInterval(id);
  }, [props.text, props.active]);

  const writing = props.active && shown.length < props.text.length;
  return (
    <p className="ai-bot-msg-text">
      {shown}
      {writing ? <span className="ai-bot-caret" aria-hidden="true" /> : null}
    </p>
  );
}

export function AiStage(props: {
  merchantKey: string;
  category?: string;
  variant?: 'panel' | 'stack';
  detailHref?: string;
}) {
  const titleId = useId();
  const variant = props.variant ?? 'panel';
  const compact = variant === 'stack';
  const [status, setStatus] = useState<StageStatus>('boot');
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [thread, setThread] = useState<ChatMsg[]>([]);
  const [lastSource, setLastSource] = useState<AiBriefAnswer['source'] | null>(null);
  const [mounted, setMounted] = useState(false);
  const [revealActionsFor, setRevealActionsFor] = useState<Record<string, boolean>>({});
  const abortRef = useRef<AbortController | null>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const reqGenRef = useRef(0);

  const thinking = status === 'boot' || status === 'thinking';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [thread, status, revealActionsFor, thinking]);

  function pushAssistant(data: ApiOk) {
    const id = uid();
    setLastSource(data.source);
    setRevealActionsFor((prev) => ({ ...prev, [id]: false }));
    setThread((prev) => [
      ...prev,
      {
        id,
        role: 'assistant',
        content: formatAssistantMessage(data),
        actions: data.actions,
        source: data.source,
        animate: true,
      },
    ]);
    setStatus('ok');
  }

  useEffect(() => {
    let cancelled = false;
    const gen = ++reqGenRef.current;

    // Ready without auto-overview: no default dump until the user asks or taps a chip.
    setStatus('boot');
    setError(null);
    setDraft('');
    setLastSource(null);
    setRevealActionsFor({});
    setThread([
      {
        id: uid(),
        role: 'system',
        content: copy.aiStage.readDone.replace('{key}', props.merchantKey),
      },
    ]);
    if (!cancelled && gen === reqGenRef.current) {
      setStatus('ok');
    }

    return () => {
      cancelled = true;
      abortRef.current?.abort();
    };
  }, [props.merchantKey]);

  async function postBrief(body: Record<string, unknown>): Promise<ApiOk | null> {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    async function once(): Promise<Response> {
      return fetch('/api/ai-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: ac.signal,
      });
    }

    let res: Response;
    try {
      res = await once();
    } catch (err) {
      if ((err as Error).name === 'AbortError') throw err;
      // One quiet retry for transient network / server restart.
      await new Promise((r) => window.setTimeout(r, 400));
      if (ac.signal.aborted) throw err;
      res = await once();
    }

    const data = (await res.json()) as ApiOk;
    if (!res.ok) {
      setError(copy.aiStage.error);
      setStatus('error');
      return null;
    }
    setError(null);
    return data;
  }

  async function runRecipe(promptId: AiRecipeId) {
    if (status === 'thinking' || status === 'boot') return;
    const gen = ++reqGenRef.current;
    const label = copy.aiStage.prompts[promptId].label;
    setThread((prev) => [...prev, { id: uid(), role: 'user', content: label }]);
    setStatus('thinking');
    setError(null);
    try {
      const data = await postBrief({
        merchantKey: props.merchantKey,
        promptId,
      });
      if (gen !== reqGenRef.current) return;
      if (!data) return;
      pushAssistant(data);
    } catch (err) {
      if (gen !== reqGenRef.current) return;
      if ((err as Error).name === 'AbortError') {
        setStatus('ok');
        return;
      }
      setStatus('error');
      setError(copy.aiStage.error);
    }
  }

  async function sendChat() {
    const message = draft.trim();
    if (!message || status === 'thinking' || status === 'boot') return;

    const gen = ++reqGenRef.current;
    const history = thread
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-6)
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    setThread((prev) => [...prev, { id: uid(), role: 'user', content: message }]);
    setDraft('');
    setStatus('thinking');
    setError(null);

    try {
      const data = await postBrief({
        merchantKey: props.merchantKey,
        promptId: AI_CHAT_PROMPT_ID,
        message,
        history,
      });
      if (gen !== reqGenRef.current) return;
      if (!data) return;
      pushAssistant({ ...data, summary: data.summary });
      inputRef.current?.focus();
    } catch (err) {
      if (gen !== reqGenRef.current) return;
      if ((err as Error).name === 'AbortError') {
        setStatus('ok');
        return;
      }
      setStatus('error');
      setError(copy.aiStage.error);
    }
  }

  const liveLabel =
    status === 'boot'
      ? copy.aiStage.liveReading
      : status === 'thinking'
        ? copy.aiStage.liveThinking
        : status === 'error'
          ? copy.aiStage.liveError
          : copy.aiStage.liveReady;

  return (
    <section
      className={`ai-bot ai-bot-${variant} reveal`}
      aria-labelledby={titleId}
      data-status={status}
    >
      <header className={`ai-bot-head${compact ? ' ai-bot-head-compact' : ''}`}>
        <div className="ai-bot-mark" aria-hidden="true">
          <span className="ai-bot-mark-core" />
          <span className="ai-bot-mark-ring" />
        </div>
        <div className="ai-bot-head-text">
          <p className="ai-bot-kicker">{copy.aiStage.brand}</p>
          {!compact ? (
            <>
              <h2 id={titleId} className="ai-bot-title">
                {copy.aiStage.sectionTitle}
              </h2>
              <p className="ai-bot-lede">
                {copy.aiStage.sectionLede
                  .replace('{key}', props.merchantKey)
                  .replace('{category}', props.category ?? props.merchantKey)}
              </p>
            </>
          ) : (
            <h2 id={titleId} className="ai-bot-title ai-bot-title-sm">
              {props.merchantKey}
              {props.category ? ` · ${props.category}` : ''}
            </h2>
          )}
          <p className="ai-bot-path">zarinpulse://merchant/{props.merchantKey}/ai</p>
        </div>
        <div className="ai-bot-head-meta">
          <p className="ai-bot-live" data-status={status}>
            <span className="ai-bot-live-dot" />
            {liveLabel}
          </p>
          {lastSource ? (
            <p className="ai-bot-source" data-source={lastSource}>
              {sourceLabel(lastSource)}
            </p>
          ) : null}
        </div>
      </header>

      <div className="ai-bot-judge-strip">
        <span>{copy.aiStage.judgeStrip.lock}</span>
        <span>{copy.aiStage.judgeStrip.noInvent}</span>
        <span>{copy.aiStage.judgeStrip.actions}</span>
        {props.detailHref ? (
          <Link className="ai-bot-detail-link" href={props.detailHref}>
            {copy.aiStage.detailLink}
          </Link>
        ) : null}
      </div>

      <div className="ai-bot-shell">
        <div className="ai-bot-thread" role="log" aria-live="polite">
          {thread.map((msg) => (
            <div key={msg.id} className="ai-bot-msg" data-role={msg.role}>
              {msg.role !== 'system' ? (
                <span className="ai-bot-msg-who">
                  {msg.role === 'user' ? copy.aiStage.you : copy.aiStage.assistant}
                </span>
              ) : null}
              <div className="ai-bot-msg-bubble">
                {msg.role === 'assistant' && msg.animate ? (
                  <TypewriterBody
                    text={msg.content}
                    active
                    onDone={() =>
                      setRevealActionsFor((prev) => ({ ...prev, [msg.id]: true }))
                    }
                  />
                ) : (
                  <p className="ai-bot-msg-text">{msg.content}</p>
                )}
                {msg.actions &&
                msg.actions.length > 0 &&
                msg.role === 'assistant' &&
                (revealActionsFor[msg.id] || !msg.animate) ? (
                  <ul className="ai-bot-action-chips ai-bot-action-reveal">
                    {msg.actions.map((a) => (
                      <li key={`${msg.id}-${a.rank}`}>
                        <div className="ai-bot-action-main">
                          <span className="ai-bot-action-rank">
                            {String(a.rank).padStart(2, '0')}
                          </span>
                          <span className="ai-bot-action-title">{a.title}</span>
                          {a.next_step ? (
                            <span className="ai-bot-action-next">{a.next_step}</span>
                          ) : null}
                        </div>
                        {a.impact_phrase ? (
                          <span className="ai-bot-action-impact">{a.impact_phrase}</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          ))}
          {thinking ? (
            <div className="ai-bot-msg" data-role="assistant">
              <span className="ai-bot-msg-who">{copy.aiStage.assistant}</span>
              <div className="ai-bot-msg-bubble ai-bot-typing" aria-label={copy.aiStage.thinkingHint}>
                <span />
                <span />
                <span />
              </div>
            </div>
          ) : null}
          <div ref={threadEndRef} />
        </div>

        <div className="ai-bot-dock">
          <div className="ai-bot-suggestions" aria-label={copy.aiStage.runHint}>
            {AI_PROMPT_IDS.map((id) => (
              <button
                key={id}
                type="button"
                className="ai-bot-suggest"
                disabled={thinking}
                onClick={() => void runRecipe(id)}
              >
                <span className="ai-bot-suggest-path">{copy.aiStage.prompts[id].path}</span>
                <span>{copy.aiStage.prompts[id].label}</span>
              </button>
            ))}
          </div>

          <form
            className="ai-bot-composer"
            onSubmit={(e) => {
              e.preventDefault();
              void sendChat();
            }}
          >
            <label className="sr-only" htmlFor="ai-bot-input">
              {copy.aiStage.chatPlaceholder}
            </label>
            <textarea
              ref={inputRef}
              id="ai-bot-input"
              className="ai-bot-input"
              rows={2}
              value={draft}
              disabled={!mounted || thinking}
              placeholder={copy.aiStage.chatPlaceholder}
              suppressHydrationWarning
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void sendChat();
                }
              }}
            />
            <button
              type="submit"
              className="ai-bot-send"
              disabled={!mounted || thinking || !draft.trim()}
              suppressHydrationWarning
            >
              {copy.aiStage.chatSend}
            </button>
          </form>

          {error ? <p className="ai-bot-error">{error}</p> : null}
          <p className="ai-bot-trust">{copy.aiStage.trust}</p>
        </div>
      </div>
    </section>
  );
}
