'use client';

import { copy, count, formatCount, formatJalali, formatRatioAsPercent } from '@zarinpulse/contracts';
import { Columns, MiniRing, RowBar, Sparkline } from './Charts';

export type GraphicEvent = {
  id: string;
  titleFa: string;
  startIso: string;
  inDataWindow: boolean;
};

export type GraphicPsp = {
  psp: string;
  n: number;
  rate: number;
};

type Props = {
  events: GraphicEvent[];
  spikeShare: number;
  spikeKey: string;
  priceBars: { label: string; value: number; detail: string }[];
  verdicts: { confirmed: number; rejected: number; untestable: number };
  recon: { ok: boolean; label: string }[];
  psp: GraphicPsp[];
};

export function GraphicSamplesLab(props: Props) {
  const totalV = props.verdicts.confirmed + props.verdicts.rejected + props.verdicts.untestable;
  const passed = props.recon.filter((c) => c.ok).length;
  const maxN = Math.max(1, ...props.psp.map((p) => p.n));
  const sortedPsp = [...props.psp].sort((a, b) => b.rate - a.rate);
  const spikeSpark = [42, 48, 51, 47, 55, 88, 52];

  return (
    <div className="space-y-8">
      <section className="chart-card space-y-4">
        <div>
          <p className="chart-title">{copy.lab.graphicCalendarTitle}</p>
          <p className="mt-1 text-sm leading-7 text-[color:var(--zp-muted)]">{copy.lab.graphicCalendarBody}</p>
        </div>
        <ol className="event-timeline" aria-label={copy.nav.calendar}>
          {props.events.map((e) => (
            <li key={e.id} data-in={e.inDataWindow ? '1' : '0'}>
              <span className="event-timeline-dot" />
              <span className="event-timeline-date">{formatJalali(e.startIso)}</span>
              <span className="event-timeline-title">{e.titleFa}</span>
              <span className="event-timeline-tag">
                {e.inDataWindow ? copy.rangeTag.inWindow : copy.rangeTag.outWindow}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="chart-card space-y-4">
        <div>
          <p className="chart-title">{copy.lab.graphicSpikeTitle}</p>
          <p className="mt-1 text-sm leading-7 text-[color:var(--zp-muted)]">{copy.lab.graphicSpikeBody}</p>
        </div>
        <div className="dash-pair">
          <article className="stat-card-row note-warning rounded-[1.1rem] border border-[color:var(--zp-border)] p-4">
            <div>
              <p className="stat-label">{copy.insufficient.single_entity_dominated}</p>
              <p className="stat-value">{props.spikeKey}</p>
              <p className="stat-hint">{formatRatioAsPercent(props.spikeShare)}</p>
            </div>
            <MiniRing ratio={props.spikeShare} ticks size="m" />
          </article>
          <div className="space-y-3">
            <Sparkline values={spikeSpark} stretch className="w-full h-14" />
            <Columns
              bars={spikeSpark.map((v, i) => ({
                label: copy.lab.weekShort[i] ?? String(i + 1),
                value: v,
                detail: formatCount(count(v * 1000)),
              }))}
            />
          </div>
        </div>
      </section>

      <section className="chart-card space-y-4">
        <div>
          <p className="chart-title">{copy.lab.graphicPricesTitle}</p>
          <p className="mt-1 text-sm leading-7 text-[color:var(--zp-muted)]">{copy.lab.graphicPricesBody}</p>
        </div>
        <p className="stat-label">{copy.uniquePricesLabel}</p>
        <ul className="space-y-3">
          {props.priceBars.map((b) => {
            const max = Math.max(1, ...props.priceBars.map((x) => x.value));
            return (
              <li key={b.label} className="rate-row">
                <div className="rate-row-meta">
                  <span className="font-medium">{b.label}</span>
                  <span className="stat-hint">{b.detail}</span>
                </div>
                <RowBar value={b.value} max={max} />
              </li>
            );
          })}
        </ul>
      </section>

      <section className="chart-card space-y-4">
        <div>
          <p className="chart-title">{copy.lab.graphicMethodTitle}</p>
          <p className="mt-1 text-sm leading-7 text-[color:var(--zp-muted)]">{copy.lab.graphicMethodBody}</p>
        </div>
        <div className="verdict-bar" role="img" aria-label={copy.nav.methodology}>
          <span
            className="verdict-bar-seg verdict-ok"
            style={{ flexGrow: props.verdicts.confirmed }}
          />
          <span
            className="verdict-bar-seg verdict-bad"
            style={{ flexGrow: props.verdicts.rejected }}
          />
          <span
            className="verdict-bar-seg verdict-warn"
            style={{ flexGrow: props.verdicts.untestable }}
          />
        </div>
        <ul className="verdict-legend">
          <li>
            <span className="verdict-swatch verdict-ok" />
            {copy.verdict.confirmed} · {formatCount(count(props.verdicts.confirmed))} /{' '}
            {formatCount(count(totalV))}
          </li>
          <li>
            <span className="verdict-swatch verdict-bad" />
            {copy.verdict.rejected} · {formatCount(count(props.verdicts.rejected))} /{' '}
            {formatCount(count(totalV))}
          </li>
          <li>
            <span className="verdict-swatch verdict-warn" />
            {copy.verdict.untestable} · {formatCount(count(props.verdicts.untestable))} /{' '}
            {formatCount(count(totalV))}
          </li>
        </ul>
      </section>

      <section className="chart-card space-y-4">
        <div>
          <p className="chart-title">{copy.lab.graphicReconTitle}</p>
          <p className="mt-1 text-sm leading-7 text-[color:var(--zp-muted)]">{copy.lab.graphicReconBody}</p>
        </div>
        <div className="stat-card-row">
          <div>
            <p className="stat-label">{copy.nav.reconciliation}</p>
            <p className="stat-value">
              {formatCount(count(passed))} / {formatCount(count(props.recon.length))}
            </p>
          </div>
          <MiniRing ratio={passed / Math.max(1, props.recon.length)} ticks size="m" />
        </div>
        <ol className="check-rail">
          {props.recon.map((c, i) => (
            <li key={c.label} data-ok={c.ok ? '1' : '0'} title={c.label}>
              <span>{formatCount(count(i + 1))}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="chart-card space-y-4">
        <div>
          <p className="chart-title">{copy.lab.graphicPspTitle}</p>
          <p className="mt-1 text-sm leading-7 text-[color:var(--zp-muted)]">{copy.lab.graphicPspBody}</p>
        </div>
        <ul className="space-y-3">
          {sortedPsp.map((p) => (
            <li key={p.psp} className="rate-row">
              <div className="rate-row-meta">
                <span className="font-medium">{p.psp}</span>
                <span className="stat-hint">
                  {formatRatioAsPercent(p.rate)} · n={formatCount(count(p.n))}
                </span>
              </div>
              <div className="rate-row-bars">
                <div className="rate-track" aria-hidden="true">
                  <span className="rate-fill" style={{ width: `${String(Math.round(p.rate * 100))}%` }} />
                </div>
                <RowBar value={p.n} max={maxN} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
