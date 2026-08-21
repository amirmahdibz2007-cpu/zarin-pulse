'use client';

import { copy, count, formatCount } from '@zarinpulse/contracts';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export type PipelineLabStep = {
  id: string;
  title: string;
  /** Static label when there is nothing to count (e.g. M282). */
  value?: string;
  /** Primary integer that counts up from 0. */
  countTo?: number;
  /** Optional second integer (e.g. 7 / 7). */
  countToB?: number;
  prefix?: string;
  suffix?: string;
  separator?: string;
  body: string;
  href?: string;
  hrefLabel?: string;
};

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function formatNonNegCount(n: number): string {
  return formatCount(count(Math.max(0, Math.trunc(n))));
}

/** Ease-out count-up; cancelled on step change so stale RAF cannot set negatives/garbage. */
function useCountUp(target: number | undefined, replayKey: string, durationMs = 1100): number {
  const safeTarget = target === undefined ? undefined : Math.max(0, Math.trunc(target));
  const [n, setN] = useState(0);

  useEffect(() => {
    if (safeTarget === undefined) {
      setN(0);
      return;
    }
    if (prefersReducedMotion() || safeTarget === 0) {
      setN(safeTarget);
      return;
    }

    let cancelled = false;
    let raf = 0;
    const start = performance.now();
    setN(0);

    const tick = (now: number) => {
      if (cancelled) return;
      const t = Math.min(1, Math.max(0, (now - start) / durationMs));
      const eased = 1 - (1 - t) ** 3;
      const next = Math.min(safeTarget, Math.max(0, Math.round(safeTarget * eased)));
      setN(next);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setN(safeTarget);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [safeTarget, replayKey, durationMs]);

  return safeTarget === undefined ? 0 : Math.min(safeTarget, Math.max(0, n));
}

function HeroValue(props: { step: PipelineLabStep; replayKey: string }) {
  const a = useCountUp(props.step.countTo, props.replayKey);
  const b = useCountUp(props.step.countToB, props.replayKey);

  if (props.step.countTo === undefined) {
    return <>{props.step.value ?? ''}</>;
  }

  const left = formatNonNegCount(a);
  if (props.step.countToB !== undefined) {
    return (
      <>
        {props.step.prefix ?? ''}
        {left}
        {props.step.separator ?? ' / '}
        {formatNonNegCount(b)}
        {props.step.suffix ?? ''}
      </>
    );
  }

  return (
    <>
      {props.step.prefix ?? ''}
      {left}
      {props.step.suffix ?? ''}
    </>
  );
}

export function PipelineLab(props: {
  steps: readonly PipelineLabStep[];
  /** Footer note; omit for product default, pass null to hide. */
  note?: string | null;
}) {
  const total = props.steps.length;
  const [index, setIndex] = useState(0);
  const step = props.steps[index];
  const atStart = index <= 0;
  const atEnd = index >= total - 1;
  const replayKey = step?.id ?? 'x';
  const note = props.note === undefined ? copy.pipeline.noteProduct : props.note;

  function go(next: number) {
    setIndex((current) => Math.max(0, Math.min(total - 1, next === current ? current : next)));
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIndex((current) => Math.min(total - 1, current + 1));
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        setIndex((current) => Math.max(0, current - 1));
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [total]);

  if (!step) return null;

  const finalLabel =
    step.countTo === undefined
      ? (step.value ?? '')
      : step.countToB !== undefined
        ? `${step.prefix ?? ''}${formatNonNegCount(step.countTo)}${step.separator ?? ' / '}${formatNonNegCount(step.countToB)}${step.suffix ?? ''}`
        : `${step.prefix ?? ''}${formatNonNegCount(step.countTo)}${step.suffix ?? ''}`;

  return (
    <section className="pipeline-stage" aria-roledescription="carousel" aria-label={copy.pipeline.title}>
      <div className="pipeline-stage-atmosphere" aria-hidden="true" />
      <div className="pipeline-stage-grain" aria-hidden="true" />

      <header className="pipeline-stage-top">
        <p className="pipeline-brand">{copy.product.name}</p>
        <p className="pipeline-progress-label">
          {String(index + 1)} {copy.pipeline.of} {String(total)}
        </p>
      </header>

      <div className="pipeline-progress" role="tablist" aria-label={copy.pipeline.title}>
        {props.steps.map((s, i) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            className={
              i === index
                ? 'pipeline-tick pipeline-tick-on'
                : i < index
                  ? 'pipeline-tick pipeline-tick-done'
                  : 'pipeline-tick'
            }
            onClick={() => go(i)}
            title={s.title}
          />
        ))}
      </div>

      <div key={step.id} className="pipeline-pane pipeline-pane-enter">
        <p className="pipeline-kicker">{step.title}</p>
        <p className="pipeline-hero" aria-label={finalLabel}>
          <HeroValue step={step} replayKey={replayKey} />
        </p>
        <p className="pipeline-lede">{step.body}</p>
        {step.href && step.hrefLabel ? (
          <Link className="pipeline-evidence" href={step.href}>
            {step.hrefLabel}
          </Link>
        ) : (
          <span className="pipeline-evidence-spacer" aria-hidden="true" />
        )}
      </div>

      <footer className="pipeline-stage-foot">
        <div className="pipeline-actions">
          <button
            type="button"
            className="pipeline-btn pipeline-btn-next"
            disabled={atEnd}
            onClick={() => go(index + 1)}
          >
            {copy.pipeline.next}
          </button>
          <button
            type="button"
            className="pipeline-btn pipeline-btn-ghost"
            disabled={atStart}
            onClick={() => go(index - 1)}
          >
            {copy.pipeline.prev}
          </button>
          <button
            type="button"
            className="pipeline-btn pipeline-btn-ghost"
            disabled={atStart}
            onClick={() => go(0)}
          >
            {copy.pipeline.replay}
          </button>
        </div>
        {note ? <p className="pipeline-note">{note}</p> : <span />}
      </footer>
    </section>
  );
}
