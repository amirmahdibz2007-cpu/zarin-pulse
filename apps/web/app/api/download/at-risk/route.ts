import { readArtifact } from '../../../../lib/artifacts';

export const runtime = 'nodejs';

export function GET(): Response {
  const rows = readArtifact<
    { key: string; customers: number; repeat_customers: number; repeat_order_share: number | null }[]
  >('at-risk.json');
  const header = 'merchant_key,customers,repeat_customers,repeat_order_share';
  const body = rows
    .map(
      (r) =>
        `${r.key},${String(r.customers)},${String(r.repeat_customers)},${String(r.repeat_order_share ?? '')}`,
    )
    .join('\n');
  return new Response(`${header}\n${body}\n`, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': 'attachment; filename="at-risk.csv"',
    },
  });
}
