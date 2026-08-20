'use client';

import { formatRatioAsPercent } from '@zarinpulse/contracts';
import { useId } from 'react';
import { insetBarPercents } from '../lib/chart-scale';

function niceMax(n: number): number {
  if (n <= 0) return 1;
  const exp = 10 ** Math.floor(Math.log10(n));
  return Math.ceil(n / exp) * exp;
}

export function Sparkline(props: {
  values: readonly number[];
  tone?: 'accent' | 'positive';
  className?: string;
  stretch?: boolean;
}) {
  if (props.values.length < 2) return null;
  const uid = useId().replace(/:/g, '');
  const min = Math.min(...props.values);
  const max = Math.max(...props.values);
  const span = Math.max(1, max - min);
  const w = 120;
  const h = 36;
  const pts = props.values.map((v, i) => {
    const x = (i / (props.values.length - 1)) * w;
    const y = h - ((v - min) / span) * (h - 8) - 4;
    return { x, y };
  });
  const line = pts.map((p) => `${String(p.x)},${String(p.y)}`).join(' ');
  const first = pts[0];
  const last = pts.at(-1);
  const area = `M ${String(first?.x ?? 0)} ${String(h)} ${pts.map((p) => `L ${String(p.x)} ${String(p.y)}`).join(' ')} L ${String(last?.x ?? w)} ${String(h)} Z`;
  const cls = props.className ? `spark ${props.className}` : 'spark';
  return (
    <svg
      className={cls}
      viewBox={`0 0 ${String(w)} ${String(h)}`}
      preserveAspectRatio={props.stretch ? 'none' : 'xMidYMid meet'}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`sg-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--zp-accent)" stopOpacity="0.42" />
          <stop offset="100%" stopColor="var(--zp-accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${uid})`} />
      <polyline className="spark-line" points={line} />
    </svg>
  );
}

export function MiniRing(props: { ratio: number; ticks?: boolean; size?: 's' | 'm' }) {
  const clamped = Math.min(1, Math.max(0, props.ratio));
  const large = props.size === 'm';
  const box = large ? 52 : 40;
  const cx = box / 2;
  const r = large ? 18 : 16;
  const c = 2 * Math.PI * r;
  const cls = large ? 'mini-ring mini-ring-m' : 'mini-ring';
  return (
    <svg className={cls} viewBox={`0 0 ${String(box)} ${String(box)}`} aria-hidden="true">
      {props.ticks
        ? Array.from({ length: 12 }, (_, i) => {
            const ang = (i / 12) * 2 * Math.PI - Math.PI / 2;
            const inner = r + 2.2;
            const outer = r + 5;
            const x1 = Number((cx + Math.cos(ang) * inner).toFixed(3));
            const y1 = Number((cx + Math.sin(ang) * inner).toFixed(3));
            const x2 = Number((cx + Math.cos(ang) * outer).toFixed(3));
            const y2 = Number((cx + Math.sin(ang) * outer).toFixed(3));
            return (
              <line
                key={i}
                className="gauge-tick"
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
              />
            );
          })
        : null}
      <circle className="ring-track" cx={cx} cy={cx} r={r} />
      <circle
        className="ring-value"
        cx={cx}
        cy={cx}
        r={r}
        transform={`rotate(-90 ${String(cx)} ${String(cx)})`}
        strokeDasharray={String(c)}
        strokeDashoffset={String(c * (1 - clamped))}
      />
    </svg>
  );
}

export function AreaLine(props: {
  points: readonly { label: string; value: number }[];
  marker?: string;
  grid?: boolean;
}) {
  const uid = useId().replace(/:/g, '');
  const w = 640;
  const h = 248;
  const pad = { l: 8, r: 12, t: 28, b: 32 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  if (props.points.length < 2) return null;
  const max = niceMax(Math.max(...props.points.map((p) => p.value)));
  const coords = props.points.map((p, i) => {
    const x = pad.l + (i / (props.points.length - 1)) * innerW;
    const y = pad.t + innerH - (p.value / max) * innerH;
    return { x, y, label: p.label, value: p.value };
  });
  const last = coords.at(-1);
  let area = `M ${String(coords[0]?.x ?? 0)} ${String(pad.t + innerH)}`;
  for (const c of coords) {
    area += ` L ${String(c.x)} ${String(c.y)}`;
  }
  area += ` L ${String(last?.x ?? 0)} ${String(pad.t + innerH)} Z`;
  const line = coords.map((c) => `${String(c.x)},${String(c.y)}`).join(' ');
  const ticks = [coords[0], coords[Math.floor(coords.length / 2)], last].filter(Boolean);
  return (
    <svg className="area-line" viewBox={`0 0 ${String(w)} ${String(h)}`} aria-hidden="true">
      <defs>
        <linearGradient id={`ag-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--zp-accent-soft)" stopOpacity="0.42" />
          <stop offset="100%" stopColor="var(--zp-accent-soft)" stopOpacity="0" />
        </linearGradient>
        <filter id={`glow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {props.grid
        ? [0, 0.5, 1].map((t) => {
            const y = pad.t + innerH * (1 - t);
            return (
              <line
                key={String(t)}
                className="area-grid"
                x1={pad.l}
                x2={w - pad.r}
                y1={y}
                y2={y}
              />
            );
          })
        : null}
      <path d={area} fill={`url(#ag-${uid})`} />
      <polyline
        className="area-stroke"
        fill="none"
        points={line}
        filter={`url(#glow-${uid})`}
      />
      {last ? (
        <g>
          <circle className="area-dot" cx={last.x} cy={last.y} r="4.5" />
          {props.marker ? (
            <text className="area-mark" x={last.x - 8} y={last.y - 12} textAnchor="end">
              {props.marker}
            </text>
          ) : null}
        </g>
      ) : null}
      {ticks.map((c) =>
        c ? (
          <text key={c.label} className="area-tick" x={c.x} y={h - 8} textAnchor="middle">
            {c.label}
          </text>
        ) : null,
      )}
    </svg>
  );
}

export function Columns(props: { bars: readonly { label: string; value: number }[] }) {
  const percents = insetBarPercents(props.bars.map((b) => b.value));
  const peak = Math.max(1, ...props.bars.map((b) => b.value));
  return (
    <ul className="col-chart">
      {props.bars.map((b, i) => (
        <li key={b.label} className="col-item">
          <div className="col-track">
            <span
              className={b.value === peak ? 'col-fill col-fill-peak' : 'col-fill'}
              style={{ height: `${String(percents[i] ?? 0)}%` }}
            />
          </div>
          <span className="col-label">{b.label}</span>
        </li>
      ))}
    </ul>
  );
}

export function FunnelStack(props: {
  stages: readonly { label: string; caption: string; ratio: number }[];
  drops?: boolean;
}) {
  return (
    <ul className="funnel-stack">
      {props.stages.map((s, i) => {
        const top = Math.max(0.28, Math.min(1, s.ratio));
        const next = props.stages[i + 1];
        const bot = Math.max(0.2, Math.min(top, next ? next.ratio : s.ratio * 0.78));
        const drop = next && s.ratio > 0 ? Math.max(0, (s.ratio - next.ratio) / s.ratio) : 0;
        return (
          <li key={s.label} className="funnel-row">
            <div
              className="funnel-trap"
              style={{
                ['--top' as string]: String(top),
                ['--bot' as string]: String(bot),
              }}
            >
              <span>{s.caption}</span>
            </div>
            <p className="funnel-label">{s.label}</p>
            {props.drops && next ? <p className="funnel-drop">{formatRatioAsPercent(drop)}</p> : null}
          </li>
        );
      })}
    </ul>
  );
}

export function RowBar(props: { value: number; max: number }) {
  const pct =
    props.max <= 0 || props.value <= 0
      ? 0
      : Math.max(4, Math.min(100, (100 * props.value) / props.max));
  return (
    <span className="row-bar-track" aria-hidden="true">
      <span className="row-bar-fill" style={{ width: `${String(pct)}%` }} />
    </span>
  );
}
