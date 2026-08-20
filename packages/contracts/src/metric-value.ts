import type { Count, PassportId, Rial } from './brands';
import type { AovBasis, FeeRealization, ImpactCurrency } from './brands';

export type InsufficientReason =
  | 'below_min_sample'
  | 'low_coverage_period'
  | 'no_peer_group'
  | 'column_mostly_null'
  | 'partial_month'
  | 'single_entity_dominated'
  | 'zero_variance'
  | 'selection_biased';

export type MetricValue<T> =
  | {
      kind: 'ok';
      value: T;
      ci: readonly [T, T] | null;
      n: Count;
      passportId: PassportId;
    }
  | {
      kind: 'insufficient';
      reason: InsufficientReason;
      n: Count;
      required: Count;
    }
  | {
      kind: 'not_applicable';
      reason: InsufficientReason;
    };

export interface Impact {
  currency: ImpactCurrency;
  conservative: MetricValue<Rial>;
  expected: MetricValue<Rial>;
  optimistic: MetricValue<Rial>;
  aovBasis: AovBasis;
}

export interface FeeAmount {
  realization: FeeRealization;
  rial: Rial;
}

export function isOk<T>(value: MetricValue<T>): value is Extract<MetricValue<T>, { kind: 'ok' }> {
  return value.kind === 'ok';
}

export function exhaustive(_value: never): never {
  throw new Error('non-exhaustive MetricValue match');
}

export function formatMetricKind<T>(value: MetricValue<T>): 'ok' | 'insufficient' | 'not_applicable' {
  switch (value.kind) {
    case 'ok':
      return 'ok';
    case 'insufficient':
      return 'insufficient';
    case 'not_applicable':
      return 'not_applicable';
    default:
      return exhaustive(value);
  }
}
