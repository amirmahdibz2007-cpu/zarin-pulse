import {
  copy,
  formatBillionsRial,
  formatCount,
  count,
  formatRatioAsPercent,
} from '@zarinpulse/contracts';
import Link from 'next/link';
import { FunnelStack, MiniRing } from '../../components/Charts';
import { LiquidCylinders } from '../../components/Infographic';
import { PageHeader, PageShell } from '../../components/PageShell';
import {
  readArtifact,
  readMerchantArtifact,
  type PlatformArtifact,
} from '../../lib/artifacts';
import { HOME_SAMPLE_MERCHANT_KEY } from '../../lib/merchant-periods';

const ORDER: Array<keyof typeof copy.terminal> = [
  'Verified',
  'InBank',
  'NoAttempt',
  'Failed',
  'Paid',
];

function cylinderTone(state: (typeof ORDER)[number]) {
  if (state === 'Verified') return 'positive' as const;
  if (state === 'InBank') return 'accent' as const;
  if (state === 'Failed') return 'negative' as const;
  if (state === 'Paid') return 'warm' as const;
  return 'muted' as const;
}

export default function AbandonmentPage() {
  const sample = readMerchantArtifact(HOME_SAMPLE_MERCHANT_KEY);
  const platform = readArtifact<PlatformArtifact>('platform.json');
  const h1 = platform.hazard.find((h) => h.k === 1);
  const h2 = platform.hazard.find((h) => h.k === 2);
  const verified = platform.terminal.Verified?.n ?? 0;
  const noAttempt = platform.terminal.NoAttempt?.n ?? 0;
  const reachedBank = platform.sessions_total - noAttempt;
  const successRatio = verified / platform.sessions_total;

  const mReached = sample.sessions - sample.no_attempt;
  const mSuccess = sample.sessions > 0 ? sample.verified / sample.sessions : 0;
  const inBankShare = sample.sessions > 0 ? sample.in_bank / sample.sessions : 0;

  return (
    <PageShell width="wide">
      <PageHeader
        kicker={`${copy.efficacy.sampleKicker} · ${sample.key}`}
        title={copy.nav.abandonment}
        lede={copy.efficacy.abandonDiagnosis}
      />

      <section className="ops-block reveal">
        <div className="dash-kpis">
          <article className="stat-card">
            <p className="stat-label">{copy.terminal.InBank}</p>
            <p className="stat-value">{formatRatioAsPercent(inBankShare)}</p>
          </article>
          <article className="stat-card">
            <p className="stat-label">{copy.terminal.Verified}</p>
            <p className="stat-value">{formatRatioAsPercent(mSuccess)}</p>
          </article>
          <article className="stat-card">
            <p className="stat-label">{copy.currency.recoverable_sales}</p>
            <p className="stat-value">
              {sample.impact ? formatBillionsRial(sample.impact.expected) : '—'}
            </p>
          </article>
        </div>
        <p className="ops-block-hint">
          <span className="font-medium">{copy.efficacy.nextStep}: </span>
          {copy.efficacy.abandonAction}
        </p>
        <div className="dash-pair mt-4">
          <article className="chart-card">
            <h2 className="chart-title">{copy.dash.funnel}</h2>
            <FunnelStack
              drops
              stages={[
                {
                  label: copy.dash.opened,
                  caption: formatCount(count(sample.sessions)),
                  ratio: 1,
                },
                {
                  label: copy.dash.reachedBank,
                  caption: formatRatioAsPercent(sample.sessions > 0 ? mReached / sample.sessions : 0),
                  ratio: sample.sessions > 0 ? mReached / sample.sessions : 0,
                },
                {
                  label: copy.terminal.Verified,
                  caption: formatRatioAsPercent(mSuccess),
                  ratio: mSuccess,
                },
              ]}
            />
          </article>
        </div>
        <div className="ops-footer-links">
          <a className="ops-ladder-link" href="/api/download/export?merchant=M31&kind=inbank">
            {copy.ops.downloadInbank}
          </a>
          {' · '}
          <Link className="ops-ladder-link" href="/customers">
            {copy.efficacy.goCustomers}
          </Link>
        </div>
      </section>

      <section className="ops-block">
        <h2 className="ops-block-title">{copy.efficacy.platformSection}</h2>
        <section className="dash-kpis">
          <article className="stat-card">
            <p className="stat-label">{copy.currency.recoverable_sales}</p>
            <p className="stat-value">{formatBillionsRial(platform.recoverable_expected_rial)}</p>
          </article>
          <article className="stat-card">
            <p className="stat-label">{copy.dash.pending}</p>
            <p className="stat-value">{formatBillionsRial(platform.paid_pending_rial)}</p>
          </article>
          <article className="stat-card stat-card-row">
            <div>
              <p className="stat-label">{copy.retry.first}</p>
              <p className="stat-value">{h1 ? formatRatioAsPercent(h1.h) : '—'}</p>
            </div>
            {h1 ? <MiniRing ratio={h1.h} ticks size="m" /> : null}
          </article>
          <article className="stat-card stat-card-row">
            <div>
              <p className="stat-label">{copy.retry.second}</p>
              <p className="stat-value">{h2 ? formatRatioAsPercent(h2.h) : '—'}</p>
            </div>
            {h2 ? <MiniRing ratio={h2.h} ticks size="m" /> : null}
          </article>
        </section>
        <section className="dash-pair mt-4">
          <article className="chart-card">
            <h2 className="chart-title">{copy.dash.funnel}</h2>
            <FunnelStack
              drops
              stages={[
                {
                  label: copy.dash.opened,
                  caption: formatCount(count(platform.sessions_total)),
                  ratio: 1,
                },
                {
                  label: copy.dash.reachedBank,
                  caption: formatRatioAsPercent(reachedBank / platform.sessions_total),
                  ratio: reachedBank / platform.sessions_total,
                },
                {
                  label: copy.terminal.Verified,
                  caption: formatRatioAsPercent(successRatio),
                  ratio: successRatio,
                },
              ]}
            />
          </article>
          <article className="chart-card">
            <h2 className="chart-title">{copy.dash.split}</h2>
            <LiquidCylinders
              series={ORDER.flatMap((state) => {
                const row = platform.terminal[state];
                if (!row) return [];
                return [
                  {
                    label: copy.terminalShort[state],
                    value: row.amount,
                    caption: formatBillionsRial(row.amount),
                    title: copy.terminal[state],
                    tone: cylinderTone(state),
                  },
                ];
              })}
            />
          </article>
        </section>
        <p className="text-sm leading-7 text-[color:var(--zp-muted)]">{copy.retry.cap}</p>
        <a
          className="control-neuro inline-flex min-h-11 items-center px-4"
          href="/api/download/paid-pending"
        >
          {copy.downloadPaid}
        </a>
      </section>
    </PageShell>
  );
}
