'use client';

import { copy } from '@zarinpulse/contracts';
import { useState } from 'react';
import { Columns, FunnelStack } from './Charts';

const WEEK_VALUES = [72, 88, 61, 55, 64, 70, 82];

export function FinalVisionLab() {
  const [play, setPlay] = useState(0);
  const weekBars = WEEK_VALUES.map((value, i) => ({
    label: copy.lab.weekShort[i]!,
    value,
    detail: copy.lab.visionWeek[i]!.detail,
    meta: copy.lab.visionWeek[i]!.meta,
    ...(i === 1 ? { badge: copy.dash.weekPeak } : {}),
  }));

  return (
    <div className="lab-grid vision-grid" key={play}>
      <header className="lab-final-head">
        <div>
          <h2 className="chart-title">{copy.lab.visionTitle}</h2>
          <p className="page-lede lab-lede">{copy.lab.visionLede}</p>
          <p className="stat-hint">{copy.lab.visionApplyAsk}</p>
        </div>
        <button
          type="button"
          className="control-neuro inline-flex min-h-11 items-center px-4"
          onClick={() => setPlay((n) => n + 1)}
        >
          {copy.lab.replay}
        </button>
      </header>

      <p className="vision-band">{copy.lab.visionHomeNote}</p>

      <section className="dash-pair">
        <article className="chart-card lab-card">
          <h2 className="chart-title">{copy.dash.funnel}</h2>
          <FunnelStack
            drops
            stages={[
              { label: copy.dash.opened, caption: copy.lab.sampleCaps[0]!, ratio: 1 },
              { label: copy.dash.reachedBank, caption: copy.lab.sampleCaps[1]!, ratio: 0.872 },
              { label: copy.terminal.Verified, caption: copy.lab.sampleCaps[2]!, ratio: 0.497 },
            ]}
          />
        </article>
        <article className="chart-card lab-card">
          <h2 className="chart-title">{copy.dash.weekCols}</h2>
          <p className="stat-hint">{copy.dash.weekScale}</p>
          <Columns bars={weekBars} />
        </article>
      </section>

      <p className="vision-band vision-band-pending">{copy.lab.visionOtherNote}</p>

      <section className="dash-pair">
        <article className="chart-card lab-card vision-mock">
          <p className="page-kicker">{copy.nav.abandonment}</p>
          <h2 className="chart-title">{copy.lab.depthAbandonTitle}</h2>
          <p className="stat-hint">{copy.lab.depthAbandonBody}</p>
          <div className="depth-stack" aria-hidden="true">
            <span className="depth-layer depth-layer-a" />
            <span className="depth-layer depth-layer-b" />
            <span className="depth-layer depth-layer-c" />
          </div>
          <p className="vision-cap">{copy.lab.visionAbandonCap}</p>
        </article>

        <article className="chart-card lab-card vision-mock">
          <p className="page-kicker">{copy.nav.fees}</p>
          <h2 className="chart-title">{copy.lab.depthFeesTitle}</h2>
          <p className="stat-hint">{copy.lab.depthFeesBody}</p>
          <ul className="depth-bars">
            {[0.92, 0.7, 0.48, 0.34].map((r, i) => (
              <li key={String(r)} style={{ ['--i' as string]: String(i), ['--r' as string]: String(r) }}>
                <span className="depth-bar-fill" />
                <span className="depth-bar-cap">{copy.lab.visionFeesCaps[i]}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="dash-pair">
        <article className="chart-card lab-card vision-mock">
          <p className="page-kicker">{copy.nav.health}</p>
          <h2 className="chart-title">{copy.lab.depthHealthTitle}</h2>
          <p className="stat-hint">{copy.lab.depthHealthBody}</p>
          <div className="depth-flip" aria-hidden="true">
            <div className="depth-flip-inner">
              <span className="depth-flip-face depth-flip-ok">
                <span>{copy.lab.visionHealthOk}</span>
              </span>
              <span className="depth-flip-face depth-flip-bad">
                <span>{copy.lab.visionHealthBad}</span>
              </span>
            </div>
          </div>
        </article>

        <article className="chart-card lab-card vision-mock">
          <p className="page-kicker">{copy.nav.peers}</p>
          <h2 className="chart-title">{copy.lab.depthPeersTitle}</h2>
          <p className="stat-hint">{copy.lab.depthPeersBody}</p>
          <div className="depth-see" aria-hidden="true">
            <span className="depth-see-beam" />
            <span className="depth-see-fulcrum" />
          </div>
          <p className="vision-cap">{copy.lab.visionPeersGap}</p>
        </article>
      </section>

      <article className="chart-card lab-card vision-mock">
        <p className="page-kicker">{copy.nav.growth}</p>
        <h2 className="chart-title">{copy.lab.depthGrowthTitle}</h2>
        <p className="stat-hint">{copy.lab.depthGrowthBody}</p>
        <div className="depth-ribbon" aria-hidden="true">
          <span className="depth-ribbon-band" />
          <span className="depth-ribbon-dot" />
          <span className="depth-ribbon-mark">{copy.lab.visionGrowthMark}</span>
        </div>
      </article>
    </div>
  );
}
