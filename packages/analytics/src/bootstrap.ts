/** FNV-1a 32-bit over a UTF-8 string. Deterministic across Node versions. */
export function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * xorshift128+ with a 128-bit state derived from a 32-bit seed.
 * Returns floats in [0, 1).
 */
export function createXorshift128Plus(seed: number) {
  let s0 = (seed >>> 0) || 0x9e3779b9;
  let s1 = Math.imul(s0, 0x85ebca6b) >>> 0 || 1;
  let s2 = Math.imul(s1, 0xc2b2ae35) >>> 0 || 2;
  let s3 = Math.imul(s2, 0x27d4eb2d) >>> 0 || 3;

  function nextUint32(): number {
    const t = (s0 + s3) >>> 0;
    s2 ^= s0;
    s0 = ((s1 << 9) | (s1 >>> 23)) >>> 0;
    s1 = s2;
    s2 = s3;
    s3 = t;
    s0 ^= s2;
    s3 = ((s3 << 11) | (s3 >>> 21)) >>> 0;
    return t >>> 0;
  }

  function next(): number {
    return nextUint32() / 0x1_0000_0000;
  }

  return { next, nextUint32 };
}

export function bootstrapMean(
  values: readonly number[],
  B: number,
  seed: number,
): { mean: number; lo: number; hi: number } {
  if (values.length === 0) {
    throw new RangeError('bootstrapMean requires a non-empty sample');
  }
  const rng = createXorshift128Plus(seed);
  const n = values.length;
  const means = new Float64Array(B);
  for (let b = 0; b < B; b += 1) {
    let sum = 0;
    for (let i = 0; i < n; i += 1) {
      const idx = Math.floor(rng.next() * n);
      sum += values[idx] ?? 0;
    }
    means[b] = sum / n;
  }
  const sorted = Array.from(means).sort((a, c) => a - c);
  const mean = values.reduce((a, v) => a + v, 0) / n;
  const lo = sorted[Math.floor(0.025 * B)] ?? mean;
  const hi = sorted[Math.min(B - 1, Math.floor(0.975 * B))] ?? mean;
  return { mean, lo, hi };
}
