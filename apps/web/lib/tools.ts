import { copy } from '@zarinpulse/contracts';
import { readArtifact, type MerchantArtifact, type PassportArtifact, type PlatformArtifact } from './artifacts';
import { healthLabel } from './health';

export const TOOL_NAMES = [
  'getMetric',
  'listCases',
  'getPassport',
  'comparePeers',
  'getPspCard',
  'getGatewayHealth',
  'getAbandonmentBreakdown',
  'getFeeDrag',
  'explainCalendarEvent',
  'listRejectedHypotheses',
] as const;

export type ToolName = (typeof TOOL_NAMES)[number];

export function runTool(name: ToolName, arg = ''): { text: string; passportId: string | null } {
  switch (name) {
    case 'getMetric': {
      const platform = readArtifact<PlatformArtifact>('platform.json');
      return {
        text: JSON.stringify({
          sessions: platform.sessions_total,
          revenue_rial: platform.revenue_rial,
          recoverable_rial: platform.recoverable_expected_rial,
        }),
        passportId: 'session_success_rate@platform',
      };
    }
    case 'listCases': {
      const cases = readArtifact<{ key: string; family: string; impactRial: number }[]>('cases.json');
      return { text: JSON.stringify(cases.slice(0, 12)), passportId: null };
    }
    case 'getPassport': {
      const id = arg || 'session_success_rate@platform';
      const p = readArtifact<PassportArtifact>(`passports/${id}.json`);
      return { text: JSON.stringify(p), passportId: p.id };
    }
    case 'comparePeers': {
      const m = readArtifact<MerchantArtifact>(`merchants/${arg || 'M31'}.json`);
      return { text: JSON.stringify({ key: m.key, peers: m.peers, impact: m.impact }), passportId: null };
    }
    case 'getPspCard': {
      const rows = readArtifact<{ psp: string; rate: number; n: number }[]>('psp.json');
      return { text: JSON.stringify(rows), passportId: null };
    }
    case 'getGatewayHealth': {
      const m = readArtifact<MerchantArtifact>(`merchants/${arg || 'M91'}.json`);
      return { text: JSON.stringify({ key: m.key, health: healthLabel(m.health) }), passportId: null };
    }
    case 'getAbandonmentBreakdown': {
      const platform = readArtifact<PlatformArtifact>('platform.json');
      return { text: JSON.stringify(platform.terminal), passportId: 'session_success_rate@platform' };
    }
    case 'getFeeDrag': {
      const fees = readArtifact<{ key: string; actual: number | null; tariff_effect: number | null }[]>(
        'fees.json',
      );
      const row = fees.find((f) => f.key === (arg || 'M106'));
      return { text: JSON.stringify(row ?? null), passportId: null };
    }
    case 'explainCalendarEvent': {
      const events = readArtifact<{ id: string; inDataWindow: boolean }[]>('calendar-events.json');
      return { text: JSON.stringify(events.find((e) => e.id === arg) ?? events[0]), passportId: null };
    }
    case 'listRejectedHypotheses': {
      return {
        text: JSON.stringify({
          rejected: [copy.hypotheses.h2, copy.hypotheses.h4, copy.hypotheses.h5],
        }),
        passportId: null,
      };
    }
    default: {
      return { text: 'unavailable', passportId: null };
    }
  }
}

export function demoAnswer(message: string): { text: string; passportId: string | null } {
  const q = message.toLowerCase();
  if (q.includes('psp')) return runTool('getPspCard');
  if (q.includes('fee') || q.includes('m106')) return runTool('getFeeDrag', 'M106');
  if (q.includes('m91') || q.includes('gateway')) return runTool('getGatewayHealth', 'M91');
  if (q.includes('hypothes')) return runTool('listRejectedHypotheses');
  if (q.includes('abandon')) return runTool('getAbandonmentBreakdown');
  return runTool('getMetric');
}
