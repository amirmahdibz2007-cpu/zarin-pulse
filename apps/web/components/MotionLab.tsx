'use client';

import { copy } from '@zarinpulse/contracts';
import { useId } from 'react';

const WEEK = [72, 88, 61, 55, 64, 70, 95];
const TREND = [42, 48, 45, 62, 58, 71, 68, 80, 76, 92];
const FUNNEL = [
  { label: 'A', w: 100 },
  { label: 'B', w: 78 },
  { label: 'C', w: 44 },
];

export function MotionLab() {
  const uid = useId().replace(/:/g, '');
  const maxW = Math.max(...WEEK);
  const maxT = Math.max(...TREND);
  const w = 320;
  const h = 120;
  const pts = TREND.map((v, i) => {
    const x = (i / (TREND.length - 1)) * (w - 16) + 8;
    const y = h - 12 - (v / maxT) * (h - 28);
    return `${String(x)},${String(y)}`;
  }).join(' ');
  const pathLen = 520;
  const c = 2 * Math.PI * 36;

  return (
    <div className="lab-grid">
      <p className="page-lede lab-lede">{copy.lab.lede}</p>
      <p className="stat-hint lab-reduced">{copy.lab.reduced}</p>

      <article className="chart-card lab-card" data-sample="a">
        <h2 className="chart-title">{copy.lab.aTitle}</h2>
        <p className="stat-hint">{copy.lab.aBody}</p>
        <svg className="lab-svg" viewBox={`0 0 ${String(w)} ${String(h)}`} aria-hidden="true">
          <polyline className="lab-draw-line" points={pts} pathLength={pathLen} />
          <circle
            className="lab-pulse-dot"
            cx={String((w - 16) * ((TREND.length - 1) / (TREND.length - 1)) + 8)}
            cy={String(h - 12 - (TREND.at(-1)! / maxT) * (h - 28))}
            r="4.5"
          />
        </svg>
      </article>

      <article className="chart-card lab-card" data-sample="b">
        <h2 className="chart-title">{copy.lab.bTitle}</h2>
        <p className="stat-hint">{copy.lab.bBody}</p>
        <ul className="lab-cols">
          {WEEK.map((v, i) => (
            <li key={String(i)} style={{ ['--i' as string]: String(i) }}>
              <span
                className={v === maxW ? 'lab-col lab-col-peak' : 'lab-col'}
                style={{ height: `${String((100 * v) / maxW)}%` }}
              />
            </li>
          ))}
        </ul>
      </article>

      <article className="chart-card lab-card" data-sample="c">
        <h2 className="chart-title">{copy.lab.cTitle}</h2>
        <p className="stat-hint">{copy.lab.cBody}</p>
        <ul className="lab-funnel">
          {FUNNEL.map((s, i) => (
            <li key={s.label} style={{ ['--i' as string]: String(i) }}>
              <div className="lab-trap" style={{ width: `${String(s.w)}%` }} />
              {i < FUNNEL.length - 1 ? <span className="lab-drop" /> : null}
            </li>
          ))}
        </ul>
      </article>

      <article className="chart-card lab-card lab-card-row" data-sample="d">
        <div>
          <h2 className="chart-title">{copy.lab.dTitle}</h2>
          <p className="stat-hint">{copy.lab.dBody}</p>
        </div>
        <svg className="lab-ring" viewBox="0 0 96 96" aria-hidden="true">
          <circle className="lab-ring-track" cx="48" cy="48" r="36" />
          <circle
            className="lab-ring-value"
            cx="48"
            cy="48"
            r="36"
            strokeDasharray={String(c)}
            strokeDashoffset={String(c * (1 - 0.497))}
            transform="rotate(-90 48 48)"
          />
        </svg>
      </article>

      <article className="chart-card lab-card" data-sample="e">
        <h2 className="chart-title">{copy.lab.eTitle}</h2>
        <p className="stat-hint">{copy.lab.eBody}</p>
        <ul className="lab-flow">
          {[1, 0.87, 0.5].map((r, i) => (
            <li key={String(i)} style={{ ['--i' as string]: String(i), ['--r' as string]: String(r) }}>
              <span className="lab-flow-fill" />
            </li>
          ))}
        </ul>
      </article>

      <p className="page-lede">{copy.lab.pick}</p>
      <svg width="0" height="0" aria-hidden="true">
        <defs>
          <linearGradient id={`lab-g-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#a68b77" />
            <stop offset="100%" stopColor="#2d2d2d" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
