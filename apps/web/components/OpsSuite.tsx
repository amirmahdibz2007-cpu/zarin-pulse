'use client';

import {
  copy,
  count,
  formatBillionsRial,
  formatCount,
  formatRatioAsPercent,
} from '@zarinpulse/contracts';
import { useState } from 'react';
import type { MerchantArtifact } from '../lib/artifacts';

type Ops = NonNullable<MerchantArtifact['ops']>;

function exportHref(merchantKey: string, kind: string): string {
  return `/api/download/export?merchant=${encodeURIComponent(merchantKey)}&kind=${encodeURIComponent(kind)}`;
}

function scaleImpact(
  impact: { conservative: number; expected: number; optimistic: number },
  pct: number,
) {
  const t = Math.min(100, Math.max(0, pct)) / 100;
  return {
    conservative: impact.conservative * t,
    expected: impact.expected * t,
    optimistic: impact.optimistic * t,
  };
}

function bandLabel(id: string): string {
  if (id === '0_5_2m') return copy.ops.bandCheap;
  if (id === '2_5m') return copy.ops.bandDear;
  return id;
}

/** Faint line-art medal used as row watermark (decorative only). */
function MedalWatermark(props: { tone: string }) {
  return (
    <svg
      className="ops-medal-mark"
      viewBox="0 0 80 96"
      aria-hidden="true"
      focusable="false"
    >
      <path
        className="ops-medal-ribbon"
        d="M28 8 L40 34 L52 8 L62 8 L46 40 L34 40 L18 8 Z"
        data-tone={props.tone}
      />
      <circle className="ops-medal-disc" cx="40" cy="62" r="26" data-tone={props.tone} />
      <circle className="ops-medal-ring" cx="40" cy="62" r="20" data-tone={props.tone} />
      <path
        className="ops-medal-star"
        d="M40 48 L43.2 56.2 L52 56.8 L45.2 62.4 L47.2 71 L40 66.2 L32.8 71 L34.8 62.4 L28 56.8 L36.8 56.2 Z"
        data-tone={props.tone}
      />
    </svg>
  );
}

export function OpsSuite(props: { merchant: MerchantArtifact }) {
  const m = props.merchant;
  const ops = m.ops as Ops | null | undefined;
  const [reducePct, setReducePct] = useState(20);

  const scaled = m.impact
    ? scaleImpact(
        {
          conservative: m.impact.conservative,
          expected: m.impact.expected,
          optimistic: m.impact.optimistic,
        },
        reducePct,
      )
    : null;

  if (!ops) return null;

  const tiers = [
    {
      id: 'gold' as const,
      label: copy.ops.gold,
      tone: 'gold',
      bucket: ops.customer_tiers.gold,
      href: exportHref(m.key, 'gold'),
      downloadLabel: copy.ops.downloadGold,
      filter: copy.ops.filterGold,
    },
    {
      id: 'silver' as const,
      label: copy.ops.silver,
      tone: 'silver',
      bucket: ops.customer_tiers.silver,
      href: null as string | null,
      downloadLabel: null as string | null,
      filter: null as string | null,
    },
    {
      id: 'bronze' as const,
      label: copy.ops.bronze,
      tone: 'bronze',
      bucket: ops.customer_tiers.bronze,
      href: null,
      downloadLabel: null,
      filter: null,
    },
    {
      id: 'at_risk' as const,
      label: copy.ops.atRisk,
      tone: 'risk',
      bucket: ops.customer_tiers.at_risk,
      href: exportHref(m.key, 'at_risk'),
      downloadLabel: copy.ops.downloadAtRiskCustomers,
      filter: copy.ops.filterAtRisk,
    },
  ];

  const cheap = ops.amount_bands.find((b) => b.id === '0_5_2m');
  const dear = ops.amount_bands.find((b) => b.id === '2_5m');

  return (
    <section className="ops-suite reveal" aria-label={copy.ops.title}>
      <header className="ops-suite-head">
        <div>
          <p className="ops-kicker">{m.key}</p>
          <h2 className="ops-title">{copy.ops.title}</h2>
          <p className="ops-lede">{copy.ops.lede}</p>
        </div>
      </header>

      <div className="ops-block ops-tiers">
        <div className="ops-block-head">
          <h3 className="ops-block-title">{copy.ops.tiersTitle}</h3>
          <p className="ops-block-hint">{copy.ops.tiersHint}</p>
        </div>

        <div
          className="ops-share"
          role="img"
          aria-label={`${copy.ops.revenueShare}: ${copy.ops.gold} ${formatRatioAsPercent(ops.customer_tiers.gold.share_of_revenue)}, ${copy.ops.silver} ${formatRatioAsPercent(ops.customer_tiers.silver.share_of_revenue)}, ${copy.ops.bronze} ${formatRatioAsPercent(ops.customer_tiers.bronze.share_of_revenue)}`}
        >
          <div className="ops-share-track">
            <span
              className="ops-share-seg"
              data-tone="gold"
              style={{ flexGrow: Math.max(ops.customer_tiers.gold.share_of_revenue, 0.02) }}
            />
            <span
              className="ops-share-seg"
              data-tone="silver"
              style={{ flexGrow: Math.max(ops.customer_tiers.silver.share_of_revenue, 0.02) }}
            />
            <span
              className="ops-share-seg"
              data-tone="bronze"
              style={{ flexGrow: Math.max(ops.customer_tiers.bronze.share_of_revenue, 0.02) }}
            />
          </div>
          <ul className="ops-share-legend">
            <li data-tone="gold">
              <span className="ops-share-dot" aria-hidden="true" />
              {copy.ops.gold} {formatRatioAsPercent(ops.customer_tiers.gold.share_of_revenue)}
            </li>
            <li data-tone="silver">
              <span className="ops-share-dot" aria-hidden="true" />
              {copy.ops.silver} {formatRatioAsPercent(ops.customer_tiers.silver.share_of_revenue)}
            </li>
            <li data-tone="bronze">
              <span className="ops-share-dot" aria-hidden="true" />
              {copy.ops.bronze} {formatRatioAsPercent(ops.customer_tiers.bronze.share_of_revenue)}
            </li>
          </ul>
        </div>

        <ol className="ops-ladder">
          {tiers.map((t, index) => (
            <li key={t.id} className="ops-ladder-row" data-tone={t.tone}>
              {t.tone !== 'risk' ? <MedalWatermark tone={t.tone} /> : null}
              <span className="ops-ladder-rank" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="ops-ladder-main">
                <p className="ops-ladder-label">{t.label}</p>
                <p className="ops-ladder-body">
                  {formatCount(count(t.bucket.customers))} {copy.ops.customers}
                  {' · '}
                  {copy.ops.revenueShare} {formatRatioAsPercent(t.bucket.share_of_revenue)}
                </p>
                {t.filter ? <p className="ops-ladder-filter">{t.filter}</p> : null}
                {t.href && t.downloadLabel ? (
                  <a className="ops-ladder-link" href={t.href}>
                    {t.downloadLabel}
                  </a>
                ) : null}
              </div>
              <div className="ops-ladder-impact">
                <p className="ops-ladder-impact-label">{copy.actionBrief.impactLabel}</p>
                <p className="ops-ladder-impact-value">{formatBillionsRial(t.bucket.revenue_rial)}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {m.impact && scaled ? (
        <div className="ops-block ops-recover">
          <div className="ops-block-head">
            <h3 className="ops-block-title">{copy.ops.recoverTitle}</h3>
            <p className="ops-block-hint">{copy.ops.recoverHint}</p>
          </div>
          <label className="ops-slider-label" htmlFor="ops-recover-slider">
            {copy.ops.recoverSlider}: {reducePct}٪
          </label>
          <input
            id="ops-recover-slider"
            className="ops-slider"
            type="range"
            min={0}
            max={50}
            step={5}
            value={reducePct}
            onChange={(e) => setReducePct(Number(e.target.value))}
          />
          <div className="ops-recover-grid">
            <article className="ops-recover-card">
              <p className="ops-recover-label">{copy.ops.recoverConservative}</p>
              <p className="ops-recover-value">{formatBillionsRial(scaled.conservative)}</p>
            </article>
            <article className="ops-recover-card" data-emphasis="true">
              <p className="ops-recover-label">{copy.ops.recoverExpected}</p>
              <p className="ops-recover-value">{formatBillionsRial(scaled.expected)}</p>
            </article>
            <article className="ops-recover-card">
              <p className="ops-recover-label">{copy.ops.recoverOptimistic}</p>
              <p className="ops-recover-value">{formatBillionsRial(scaled.optimistic)}</p>
            </article>
          </div>
          <a className="ops-download control-neuro" href={exportHref(m.key, 'inbank')}>
            {copy.ops.downloadInbank}
          </a>
          <p className="ops-filter">{copy.ops.filterInbank}</p>
        </div>
      ) : null}

      <div className="ops-pair">
        <div className="ops-block">
          <div className="ops-block-head">
            <h3 className="ops-block-title">{copy.ops.peaksTitle}</h3>
            <p className="ops-block-hint">{copy.ops.peaksHint}</p>
          </div>
          <ol className="ops-peak-list">
            {ops.sales_peaks.top_days.map((d, i) => (
              <li key={d.day} className="ops-peak-row">
                <span className="ops-peak-rank">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <p className="ops-peak-day">{d.day}</p>
                  <p className="ops-peak-meta">
                    {formatCount(count(d.orders))} {copy.dash.weekOrders}
                    {' · '}
                    {formatBillionsRial(d.revenue_rial)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <a className="ops-download control-neuro" href={exportHref(m.key, 'peak_days')}>
            {copy.ops.downloadPeaks}
          </a>
          <p className="ops-filter">{copy.ops.filterPeaks}</p>
        </div>

        <div className="ops-block">
          <div className="ops-block-head">
            <h3 className="ops-block-title">{copy.ops.bandsTitle}</h3>
            <p className="ops-block-hint">{copy.ops.bandsHint}</p>
          </div>
          <div className="ops-band-compare">
            {[cheap, dear].filter(Boolean).map((b) => (
              <article key={b!.id} className="ops-band-card">
                <p className="ops-band-label">{bandLabel(b!.id)}</p>
                <p className="ops-band-rate">{formatRatioAsPercent(b!.success_rate)}</p>
                <p className="ops-band-meta">
                  {copy.ops.successRate}
                  {' · '}
                  {formatCount(count(b!.sessions))} {copy.dash.sessions}
                </p>
              </article>
            ))}
          </div>
          <p className="ops-band-action">{copy.ops.bandAction}</p>
        </div>
      </div>
    </section>
  );
}
