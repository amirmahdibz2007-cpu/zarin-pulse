'use client';

import type { MutableRefObject, ReactNode } from 'react';
import { createContext, useContext, useEffect, useId, useRef } from 'react';
import { DetailDisclosure } from './DetailDisclosure';
import { EvidenceLink } from './EvidenceLink';
import { vialFillPercent } from '../lib/chart-scale';

function preferReducedMotion(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

type Wave = { t: number; amp: number };
type KickFn = () => void;

const SloshSubscribe = createContext<MutableRefObject<Set<KickFn>> | null>(null);

export function SloshRoot(props: { children: ReactNode }) {
  const listeners = useRef(new Set<KickFn>());

  useEffect(() => {
    function kickAll() {
      for (const fn of listeners.current) fn();
    }
    kickAll();
    function onVis() {
      if (document.visibilityState === 'visible') kickAll();
    }
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  return <SloshSubscribe.Provider value={listeners}>{props.children}</SloshSubscribe.Provider>;
}

function useLiquidWave(active: boolean): MutableRefObject<Wave> {
  const wave = useRef<Wave>({ t: 0, amp: 0 });
  const sub = useContext(SloshSubscribe);

  useEffect(() => {
    if (!active || preferReducedMotion()) {
      wave.current = { t: 0, amp: 0 };
      return undefined;
    }
    const REST = 1.05;
    const KICK = 6.8;
    let running = true;
    let last = performance.now();
    let raf = 0;
    wave.current.amp = KICK;

    function frame(now: number) {
      if (!running) return;
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      const w = wave.current;
      w.t += dt * 1.7;
      w.amp = REST + (w.amp - REST) * Math.exp(-dt * 3.4);
      raf = window.requestAnimationFrame(frame);
    }

    const onKick = () => {
      wave.current.amp = KICK;
    };
    raf = window.requestAnimationFrame(frame);
    sub?.current.add(onKick);
    return () => {
      running = false;
      window.cancelAnimationFrame(raf);
      sub?.current.delete(onKick);
    };
  }, [active, sub]);

  return wave;
}

function vialPath(fillPct: number, t: number, amp: number): string {
  const x0 = 10;
  const x1 = 46;
  const y0 = 8;
  const y1 = 152;
  const width = x1 - x0;
  const height = y1 - y0;
  const surface = y0 + height * (1 - fillPct / 100);
  const steps = 18;
  let d = `M ${String(x0)} ${String(y1)}`;
  for (let i = 0; i <= steps; i += 1) {
    const u = i / steps;
    const x = x0 + width * u;
    const tilt = amp * 0.5 * (u - 0.5);
    const y = Math.min(
      y1 - 2,
      Math.max(
        y0 + 2,
        surface +
          tilt +
          amp * Math.sin(u * Math.PI * 2 + t) +
          amp * 0.2 * Math.sin(u * Math.PI * 4 + t * 1.35),
      ),
    );
    d += ` L ${String(x)} ${String(y)}`;
  }
  d += ` L ${String(x1)} ${String(y1)} Z`;
  return d;
}

function barPath(fillPct: number, t: number, amp: number): string {
  const w = 400;
  const h = 28;
  const edge = w * (1 - fillPct / 100);
  const steps = 12;
  let d = `M ${String(w)} 0 L ${String(w)} ${String(h)}`;
  for (let i = 0; i <= steps; i += 1) {
    const u = i / steps;
    const y = h * (1 - u);
    const x = Math.max(
      0,
      Math.min(
        w,
        edge + amp * 0.85 * Math.sin(u * Math.PI * 2 + t) + amp * 0.18 * Math.sin(u * Math.PI * 3 + t * 1.25),
      ),
    );
    d += ` L ${String(x)} ${String(y)}`;
  }
  d += ' Z';
  return d;
}

export function RingMeter(props: {
  ratio: number;
  value: ReactNode;
  label: string;
  technicalFa?: string;
  passportId?: string;
  tone?: 'neutral' | 'positive' | 'negative';
}) {
  const clamped = Math.min(1, Math.max(0, props.ratio));
  const r = 38;
  const c = 2 * Math.PI * r;
  const toneClass =
    props.tone === 'positive' ? 'ring-positive' : props.tone === 'negative' ? 'ring-negative' : 'ring-accent';
  return (
    <article className="surface-kpi ring-card">
      <div className="ring-wrap">
        <svg className={`ring-svg ${toneClass}`} viewBox="0 0 100 100" aria-hidden="true">
          <circle className="ring-track" cx="50" cy="50" r={r} />
          <circle
            className="ring-value"
            cx="50"
            cy="50"
            r={r}
            strokeDasharray={String(c)}
            strokeDashoffset={String(c * (1 - clamped))}
          />
        </svg>
        <div className="ring-center">{props.value}</div>
      </div>
      <p className="kpi-plain">{props.label}</p>
      {props.technicalFa ? <DetailDisclosure technicalFa={props.technicalFa} /> : null}
      {props.passportId ? <EvidenceLink passportId={props.passportId} /> : null}
    </article>
  );
}

type SeriesTone = 'muted' | 'positive' | 'negative' | 'accent' | 'warm';

export function LiquidCylinders(props: {
  series: readonly { label: string; value: number; caption?: string; title?: string; tone?: SeriesTone }[];
}) {
  const max = Math.max(1, ...props.series.map((s) => s.value));
  const wave = useLiquidWave(props.series.length > 0);
  const paths = useRef<Array<SVGPathElement | null>>([]);
  const uid = useId().replace(/:/g, '');

  useEffect(() => {
    let raf = 0;
    const reduced = preferReducedMotion();
    function paint() {
      const { t, amp } = wave.current;
      props.series.forEach((row, i) => {
        const el = paths.current[i];
        if (!el) return;
        const pct = vialFillPercent(row.value, max);
        el.setAttribute('d', vialPath(pct, t, reduced ? 0 : amp));
      });
      raf = window.requestAnimationFrame(paint);
    }
    paint();
    return () => window.cancelAnimationFrame(raf);
  }, [max, props.series, wave]);

  return (
    <ul className="surface-well liquid-cyl-row">
      {props.series.map((row, i) => {
        const tone = row.tone ?? 'muted';
        const clip = `vial-${uid}-${String(i)}`;
        return (
          <li key={row.label} className="liquid-cyl" title={row.title ?? row.label}>
            <svg className={`vial vial-${tone}`} viewBox="0 0 56 160" aria-hidden="true">
              <defs>
                <clipPath id={clip}>
                  <rect x="10" y="8" width="36" height="144" rx="18" />
                </clipPath>
              </defs>
              <rect className="vial-glass" x="10" y="8" width="36" height="144" rx="18" />
              <path
                ref={(node) => {
                  paths.current[i] = node;
                }}
                className="vial-liquid"
                clipPath={`url(#${clip})`}
                d={vialPath(vialFillPercent(row.value, max), 0, 0)}
              />
              <path className="vial-shine" d="M18 22 C16 50 16 90 18 138" />
            </svg>
            {row.caption ? <p className="cyl-caption">{row.caption}</p> : null}
            <p className="cyl-label">{row.label}</p>
          </li>
        );
      })}
    </ul>
  );
}

export function LiquidBars(props: {
  series: readonly { label: string; value: number; tone?: SeriesTone }[];
}) {
  const max = Math.max(1, ...props.series.map((s) => s.value));
  const peak = Math.max(...props.series.map((s) => s.value), 0);
  const wave = useLiquidWave(props.series.length > 0);
  const paths = useRef<Array<SVGPathElement | null>>([]);
  const uid = useId().replace(/:/g, '');

  useEffect(() => {
    let raf = 0;
    const reduced = preferReducedMotion();
    function paint() {
      const { t, amp } = wave.current;
      props.series.forEach((row, i) => {
        const el = paths.current[i];
        if (!el) return;
        const pct = Math.max(4, Math.round((100 * row.value) / max));
        el.setAttribute('d', barPath(pct, t, reduced ? 0 : amp));
      });
      raf = window.requestAnimationFrame(paint);
    }
    paint();
    return () => window.cancelAnimationFrame(raf);
  }, [max, props.series, wave]);

  return (
    <ul className="surface-well space-y-4">
      {props.series.map((row, i) => {
        const tone = row.tone ?? (row.value === peak ? 'accent' : 'muted');
        const clip = `bar-${uid}-${String(i)}`;
        return (
          <li key={row.label}>
            <p className="mb-1 text-sm text-[color:var(--zp-muted)]">{row.label}</p>
            <svg
              className={`liquid-h-svg liquid-h-${tone}`}
              viewBox="0 0 400 28"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <clipPath id={clip}>
                  <rect x="0" y="0" width="400" height="28" rx="14" />
                </clipPath>
              </defs>
              <rect className="liquid-h-track" x="0" y="0" width="400" height="28" rx="14" />
              <path
                ref={(node) => {
                  paths.current[i] = node;
                }}
                className="vial-liquid"
                clipPath={`url(#${clip})`}
                d={barPath(Math.max(4, Math.round((100 * row.value) / max)), 0, 0)}
              />
            </svg>
          </li>
        );
      })}
    </ul>
  );
}
