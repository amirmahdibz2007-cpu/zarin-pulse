'use client';

import { copy } from '@zarinpulse/contracts';
import { useState } from 'react';

const WEEK = [72, 88, 61, 55, 64, 70, 95];
const FUNNEL_W = [100, 78, 44];
const FLOW_R = [1, 0.872, 0.497];
const STAGE_KEYS = ['opened', 'reachedBank', 'verified'] as const;

function stageLabel(key: (typeof STAGE_KEYS)[number]): string {
  if (key === 'opened') return copy.dash.opened;
  if (key === 'reachedBank') return copy.dash.reachedBank;
  return copy.terminal.Verified;
}

export function MotionLab() {
  const [play, setPlay] = useState(0);
  const maxW = Math.max(...WEEK);

  return (
    <div className="lab-grid" key={play}>
      <header className="lab-final-head">
        <div>
          <h2 className="chart-title">{copy.lab.finalTitle}</h2>
          <p className="page-lede lab-lede">{copy.lab.finalBody}</p>
        </div>
        <button
          type="button"
          className="control-neuro inline-flex min-h-11 items-center px-4"
          onClick={() => setPlay((n) => n + 1)}
        >
          {copy.lab.replay}
        </button>
      </header>

      <section className="dash-pair lab-final-pair">
        <article className="chart-card lab-card" data-sample="c">
          <h2 className="chart-title">{copy.lab.cTitle}</h2>
          <p className="stat-hint">{copy.lab.cBody}</p>
          <ul className="lab-funnel lab-funnel-seq">
            {STAGE_KEYS.map((key, i) => (
              <li key={key} style={{ ['--i' as string]: String(i) }}>
                <div className="lab-trap" style={{ width: `${String(FUNNEL_W[i])}%` }}>
                  <span className="lab-trap-cap">{copy.lab.sampleCaps[i]}</span>
                </div>
                <p className="lab-stage-label">{stageLabel(key)}</p>
                {i < STAGE_KEYS.length - 1 ? (
                  <p className="lab-drop-pill">
                    {copy.lab.dropLabel} {copy.lab.sampleDrops[i]}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </article>

        <article className="chart-card lab-card" data-sample="b">
          <h2 className="chart-title">{copy.lab.bTitle}</h2>
          <p className="stat-hint">{copy.lab.bBody}</p>
          <ul className="lab-cols">
            {WEEK.map((v, i) => (
              <li key={copy.lab.weekShort[i]} style={{ ['--i' as string]: String(i) }}>
                <span
                  className={v === maxW ? 'lab-col lab-col-peak' : 'lab-col'}
                  style={{ height: `${String((100 * v) / maxW)}%` }}
                />
                <span className="lab-col-label">{copy.lab.weekShort[i]}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <article className="chart-card lab-card" data-sample="e">
        <h2 className="chart-title">{copy.lab.eTitle}</h2>
        <p className="stat-hint">{copy.lab.eBody}</p>
        <ul className="lab-flow lab-flow-seq">
          {STAGE_KEYS.map((key, i) => (
            <li key={key} style={{ ['--i' as string]: String(i) }}>
              <div className="lab-flow-meta">
                <span>{stageLabel(key)}</span>
                <span>{copy.lab.sampleCaps[i]}</span>
              </div>
              <div className="lab-flow-track">
                <span
                  className="lab-flow-fill"
                  style={{ ['--r' as string]: String(FLOW_R[i]) }}
                />
              </div>
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}
