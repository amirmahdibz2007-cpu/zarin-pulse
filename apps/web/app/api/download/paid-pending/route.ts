import { readArtifact } from '../../../../lib/artifacts';

export const runtime = 'nodejs';

export function GET(): Response {
  const rows = readArtifact<{ key: string; paid_pending: number; paid_amount_rial: number }[]>(
    'paid-pending.json',
  );
  const header = 'merchant_key,paid_pending,paid_amount_rial';
  const body = rows.map((r) => `${r.key},${String(r.paid_pending)},${String(r.paid_amount_rial)}`).join('\n');
  return new Response(`${header}\n${body}\n`, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': 'attachment; filename="paid-pending.csv"',
    },
  });
}
