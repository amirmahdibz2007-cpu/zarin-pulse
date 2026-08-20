export type BusinessModel = 'subscription_like' | 'repeat_like' | 'one_shot';

export function classifyBusinessModel(input: {
  repeatCustomerShare: number;
  medianGapDays: number | null;
  verifiedOrders: number;
}): BusinessModel | null {
  if (input.verifiedOrders < 500) return null;
  if (
    input.repeatCustomerShare >= 0.6 &&
    input.medianGapDays !== null &&
    input.medianGapDays >= 20 &&
    input.medianGapDays <= 40
  ) {
    return 'subscription_like';
  }
  if (input.repeatCustomerShare >= 0.25) return 'repeat_like';
  return 'one_shot';
}

export function customerAtRisk(input: {
  lastOrderIso: string;
  intervalDays: number;
  dataEndIso: string;
}): boolean {
  const last = Date.parse(`${input.lastOrderIso}T00:00:00Z`);
  const end = Date.parse(`${input.dataEndIso}T00:00:00Z`);
  if (!Number.isFinite(last) || !Number.isFinite(end)) return false;
  const fourteen = 14 * 86_400_000;
  if (end - last < fourteen) return false;
  const expected = last + input.intervalDays * 86_400_000;
  return expected + 7 * 86_400_000 < end;
}
