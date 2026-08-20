'use client';

import { copy } from '@zarinpulse/contracts';
import { useState } from 'react';

export function DepthLab() {
  const [play, setPlay] = useState(0);

  return (
    <div className="lab-grid" key={play}>
      <header className="lab-final-head">
        <div>
          <h2 className="chart-title">{copy.lab.depthTitle}</h2>
          <p className="page-lede lab-lede">{copy.lab.depthLede}</p>
        </div>
        <button
          type="button"
          className="control-neuro inline-flex min-h-11 items-center px-4"
          onClick={() => setPlay((n) => n + 1)}
        >
          {copy.lab.replay}
        </button>
      </header>

      <section className="dash-pair">
        <article className="chart-card lab-card">
          <h2 className="chart-title">{copy.lab.depthAbandonTitle}</h2>
          <p className="stat-hint">{copy.lab.depthAbandonBody}</p>
          <div className="depth-stack" aria-hidden="true">
            <span className="depth-layer depth-layer-a" />
            <span className="depth-layer depth-layer-b" />
            <span className="depth-layer depth-layer-c" />
          </div>
        </article>

        <article className="chart-card lab-card">
          <h2 className="chart-title">{copy.lab.depthFeesTitle}</h2>
          <p className="stat-hint">{copy.lab.depthFeesBody}</p>
          <ul className="depth-bars">
            {[0.92, 0.7, 0.48, 0.34].map((r, i) => (
              <li key={String(r)} style={{ ['--i' as string]: String(i), ['--r' as string]: String(r) }}>
                <span className="depth-bar-fill" />
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="dash-pair">
        <article className="chart-card lab-card">
          <h2 className="chart-title">{copy.lab.depthHealthTitle}</h2>
          <p className="stat-hint">{copy.lab.depthHealthBody}</p>
          <div className="depth-flip" aria-hidden="true">
            <div className="depth-flip-inner">
              <span className="depth-flip-face depth-flip-ok" />
              <span className="depth-flip-face depth-flip-bad" />
            </div>
          </div>
        </article>

        <article className="chart-card lab-card">
          <h2 className="chart-title">{copy.lab.depthPeersTitle}</h2>
          <p className="stat-hint">{copy.lab.depthPeersBody}</p>
          <div className="depth-see" aria-hidden="true">
            <span className="depth-see-beam" />
            <span className="depth-see-fulcrum" />
          </div>
        </article>
      </section>

      <article className="chart-card lab-card">
        <h2 className="chart-title">{copy.lab.depthGrowthTitle}</h2>
        <p className="stat-hint">{copy.lab.depthGrowthBody}</p>
        <div className="depth-ribbon" aria-hidden="true">
          <span className="depth-ribbon-band" />
          <span className="depth-ribbon-dot" />
        </div>
      </article>
    </div>
  );
}
