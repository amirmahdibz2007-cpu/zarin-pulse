import { wilsonInterval } from './wilson';

export function retryHazard(atRisk: number, won: number): {
  h: number;
  ci: readonly [number, number] | null;
  insufficient: boolean;
} {
  if (!Number.isInteger(atRisk) || !Number.isInteger(won) || atRisk < 0 || won < 0) {
    throw new RangeError(`hazard requires integer atRisk/won: ${atRisk}/${won}`);
  }
  if (won > atRisk) {
    throw new RangeError(`won cannot exceed atRisk: ${won}/${atRisk}`);
  }
  if (atRisk === 0) {
    return { h: 0, ci: null, insufficient: true };
  }
  const h = won / atRisk;
  if (atRisk < 100) {
    return { h, ci: null, insufficient: true };
  }
  return { h, ci: wilsonInterval(won, atRisk), insufficient: false };
}

export function optimalRetryCap(hazards: readonly { k: number; h: number; atRisk: number }[]): number {
  const useful = hazards.filter((row) => row.atRisk >= 100 && row.h >= 0.01);
  if (useful.length === 0) return 1;
  return Math.max(...useful.map((row) => row.k));
}
