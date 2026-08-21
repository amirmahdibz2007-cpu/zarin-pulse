import { tryReadArtifact } from '../../../../lib/artifacts';

export const runtime = 'nodejs';

const KINDS = {
  gold: { file: 'gold-customers.json', filename: 'gold-customers.csv' },
  at_risk: { file: 'at-risk-customers.json', filename: 'at-risk-customers.csv' },
  inbank: { file: 'inbank-sessions.json', filename: 'inbank-sessions.csv' },
  peak_days: { file: 'peak-days-sessions.json', filename: 'peak-days-sessions.csv' },
} as const;

type Kind = keyof typeof KINDS;

function isKind(v: string): v is Kind {
  return v in KINDS;
}

function csvEscape(value: unknown): string {
  const s = value === null || value === undefined ? '' : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
  return s;
}

function rowsToCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return '';
  const keys = Object.keys(rows[0]!);
  const lines = [keys.join(',')];
  for (const row of rows) {
    lines.push(keys.map((k) => csvEscape(row[k])).join(','));
  }
  return `${lines.join('\n')}\n`;
}

export function GET(req: Request): Response {
  const url = new URL(req.url);
  const merchant = (url.searchParams.get('merchant') ?? '').trim();
  const kindRaw = (url.searchParams.get('kind') ?? '').trim();

  if (!/^[A-Za-z0-9_-]{1,32}$/.test(merchant) || !isKind(kindRaw)) {
    return new Response(JSON.stringify({ error: 'invalid_export' }), {
      status: 400,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }

  const meta = KINDS[kindRaw];
  const relative = `exports/${merchant}/${meta.file}`;
  const rows = tryReadArtifact<Record<string, unknown>[]>(relative);
  if (!rows) {
    return new Response(JSON.stringify({ error: 'export_not_found' }), {
      status: 404,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }

  const body = `\uFEFF${rowsToCsv(rows)}`;
  return new Response(body, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="${merchant}-${meta.filename}"`,
      'cache-control': 'no-store',
    },
  });
}
