declare const brand: unique symbol;

type Brand<T, B extends string> = T & { readonly [brand]: B };

export type Rial = Brand<number, 'Rial'>;
export type Ratio = Brand<number, 'Ratio'>;
export type Percent = Brand<number, 'Percent'>;
export type Count = Brand<number, 'Count'>;
export type Days = Brand<number, 'Days'>;
export type MerchantKey = Brand<string, 'MerchantKey'>;
export type CategoryId = Brand<string, 'CategoryId'>;
export type PspCode = Brand<string, 'PspCode'>;
export type IsoDate = Brand<string, 'IsoDate'>;
export type PassportId = Brand<string, 'PassportId'>;

export const rial = (n: number): Rial => {
  if (!Number.isInteger(n) || n < 0) {
    throw new RangeError(`Rial باید صحیح نامنفی باشد: ${n}`);
  }
  return n as Rial;
};

export const count = (n: number): Count => {
  if (!Number.isInteger(n) || n < 0) {
    throw new RangeError(`Count باید صحیح نامنفی باشد: ${n}`);
  }
  return n as Count;
};

export type TerminalState =
  | 'Verified'
  | 'InBank'
  | 'NoAttempt'
  | 'Failed'
  | 'Paid'
  | 'Reversed';

export type AovBasis = 'own' | 'median_attempted' | 'peer_aov';
export type FeeRealization = 'realized' | 'potential';
export type ImpactCurrency =
  | 'pending_reconciliation'
  | 'recoverable_sales'
  | 'value_at_risk';
