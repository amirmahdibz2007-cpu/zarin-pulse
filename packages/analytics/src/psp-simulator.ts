export function simulatePspShift(input: {
  sessions: number;
  deltaShare: number;
  bands: readonly { weight: number; pFrom: number; pTo: number }[];
}): number {
  if (input.sessions < 0 || input.deltaShare < 0) {
    throw new RangeError('simulatePspShift requires non-negative sessions and deltaShare');
  }
  const lift = input.bands.reduce((acc, band) => acc + band.weight * (band.pTo - band.pFrom), 0);
  return input.deltaShare * input.sessions * lift;
}
