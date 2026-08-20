import { copy, formatBillionsRial, formatCount, count, formatRatioAsPercent, formatRial } from '@zarinpulse/contracts';
import { notFound } from 'next/navigation';
import { ActionBrief } from '../../../components/ActionBrief';
import { FunnelStack, MiniRing } from '../../../components/Charts';
import { PageHeader, PageShell } from '../../../components/PageShell';
import { StatusPill } from '../../../components/StatusPill';
import {
  tryReadArtifact,
  type MerchantArtifact,
  type MerchantIndexRow,
} from '../../../lib/artifacts';
import { buildMerchantActions, isSparseMerchant } from '../../../lib/merchant-actions';
import { healthAction } from '../../../lib/health';

export function generateStaticParams() {
  const index = tryReadArtifact<MerchantIndexRow[]>('merchants-index.json') ?? [];
  return index.map((m) => ({ key: m.key }));
}

export default async function MerchantPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const m = tryReadArtifact<MerchantArtifact>(`merchants/${key}.json`);
  if (!m) notFound();
  const aovLabel =
    m.impact?.basis === 'own'
      ? copy.aovBasis.own
      : m.impact?.basis === 'median_attempted'
        ? copy.aovBasis.median_attempted
        : copy.aovBasis.peer_aov;
  const playbook =
    m.case_family && m.case_family in copy.playbook
      ? copy.playbook[m.case_family as keyof typeof copy.playbook]
      : healthAction(m.health);
  const model =
    m.business_model && m.business_model in copy.businessModel
      ? copy.businessModel[m.business_model as keyof typeof copy.businessModel]
      : copy.businessModel.insufficient;
  if (isSparseMerchant(m)) {
    return (
      <PageShell>
        <PageHeader title={m.key} lede={copy.sparseNote} />
        <ActionBrief merchantKey={m.key} actions={buildMerchantActions(m)} />
      </PageShell>
    );
  }
  const reachedBank = m.sessions - m.no_attempt;
  const successRatio = m.sessions > 0 ? m.verified / m.sessions : 0;
  const actions = buildMerchantActions(m);
  return (
    <PageShell width="wide">
      <header className="dash-hero reveal">
        <p className="page-kicker">{m.category}</p>
        <p className="stat-label">{copy.currency.recoverable_sales}</p>
        <p className="hero-value">
          {m.impact ? formatBillionsRial(m.impact.expected) : '—'}
        </p>
        <p className="page-lede">{m.key}</p>
        <StatusPill code={m.health} />
      </header>
      <p className="text-sm text-[color:var(--zp-muted)]">{copy.monthRevenue}</p>
      <section className="dash-kpis">
        <article className="stat-card stat-card-row">
          <div>
            <p className="stat-label">{copy.terminal.Verified}</p>
            <p className="stat-value stat-value-accent">{formatRatioAsPercent(m.success_rate)}</p>
          </div>
          <MiniRing ratio={m.success_rate} ticks size="m" />
        </article>
        <article className="stat-card">
          <p className="stat-label">{copy.currency.pending_reconciliation}</p>
          <p className="stat-value">{formatRial(m.paid_amount_rial)}</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">{copy.fee.realized}</p>
          <p className="stat-value">
            {m.fee_actual !== null ? formatRatioAsPercent(m.fee_actual) : '—'}
          </p>
        </article>
        <article className="stat-card">
          <p className="stat-label">{copy.dash.sessions}</p>
          <p className="stat-value">{formatCount(count(m.sessions))}</p>
        </article>
      </section>
      <ActionBrief merchantKey={m.key} actions={actions} />
      <article className="chart-card">
        <h2 className="chart-title">{copy.dash.funnel}</h2>
        <FunnelStack
          drops
          stages={[
            {
              label: copy.dash.opened,
              caption: formatCount(count(m.sessions)),
              ratio: 1,
            },
            {
              label: copy.dash.reachedBank,
              caption: formatRatioAsPercent(m.sessions > 0 ? reachedBank / m.sessions : 0),
              ratio: m.sessions > 0 ? reachedBank / m.sessions : 0,
            },
            {
              label: copy.terminal.Verified,
              caption: formatRatioAsPercent(successRatio),
              ratio: successRatio,
            },
          ]}
        />
      </article>
      {m.impact ? (
        <p className="text-sm text-[color:var(--zp-muted)]">
          {formatBillionsRial(m.impact.conservative)} · {formatBillionsRial(m.impact.optimistic)} ·{' '}
          {aovLabel}
        </p>
      ) : (
        <p className="text-sm text-[color:var(--zp-muted)]">{aovLabel}</p>
      )}
      <p className="text-sm text-[color:var(--zp-muted)]">{copy.impactNoSum}</p>
      <p className="surface-panel leading-7">{playbook}</p>
      <p className="text-sm text-[color:var(--zp-muted)]">{model}</p>
    </PageShell>
  );
}
