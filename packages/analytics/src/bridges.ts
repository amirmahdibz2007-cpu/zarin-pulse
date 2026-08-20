/** Volume-price identity: ΔR = ΔN·A₋₁ + N₋₁·ΔA + ΔN·ΔA */
export function volumePriceBridge(prevN: number, prevAov: number, nextN: number, nextAov: number) {
  const dN = nextN - prevN;
  const dA = nextAov - prevAov;
  const qty = dN * prevAov;
  const price = prevN * dA;
  const interaction = dN * dA;
  const delta = nextN * nextAov - prevN * prevAov;
  return { qty, price, interaction, delta, identity: qty + price + interaction };
}

/** Customer revenue bridge. All parts in rial. Must sum to delta. */
export interface CustomerBridgeParts {
  newly: number;
  resurrected: number;
  expansion: number;
  contraction: number;
  churned: number;
}

export function customerBridge(parts: CustomerBridgeParts, prevRevenue: number, nextRevenue: number) {
  const composed =
    parts.newly + parts.resurrected + parts.expansion - parts.contraction - parts.churned;
  const delta = nextRevenue - prevRevenue;
  return { composed, delta, ok: composed === delta };
}

/**
 * Success-gap identity:
 * S = (1-a)·b
 * S_P − S_m = (a_m − a_P)·b_P + (1 − a_m)·(b_P − b_m)
 */
export function successGapDecompose(
  abandonM: number,
  convertGivenAttemptM: number,
  abandonP: number,
  convertGivenAttemptP: number,
) {
  const sM = (1 - abandonM) * convertGivenAttemptM;
  const sP = (1 - abandonP) * convertGivenAttemptP;
  const composition = (abandonM - abandonP) * convertGivenAttemptP;
  const rate = (1 - abandonM) * (convertGivenAttemptP - convertGivenAttemptM);
  return { sM, sP, gap: sP - sM, composition, rate, identity: composition + rate };
}

/** Kitagawa: Σ (w_P − w_m) p_P  +  Σ w_m (p_P − p_m) */
export function kitagawa(
  strata: readonly { weightM: number; weightP: number; rateM: number; rateP: number }[],
) {
  let composition = 0;
  let rate = 0;
  for (const s of strata) {
    composition += (s.weightP - s.weightM) * s.rateP;
    rate += s.weightM * (s.rateP - s.rateM);
  }
  return { composition, rate, gap: composition + rate };
}
