import type { Count } from '../brands';
import { toFaDigits } from './jalali';

function groupThousands(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '٬');
}

export function formatCount(n: Count): string {
  if (!Number.isInteger(n) || n < 0) {
    throw new RangeError(`Count format requires a non-negative integer: ${n}`);
  }
  return toFaDigits(groupThousands(String(n)));
}

export function formatRial(n: number): string {
  if (!Number.isInteger(n)) {
    throw new RangeError(`Rial format requires an integer: ${n}`);
  }
  const sign = n < 0 ? '−' : '';
  return `${sign}${toFaDigits(groupThousands(String(Math.abs(n))))} ریال`;
}

/** Percent with one decimal, already in 0–100 display units. */
export function formatPercentPoints(points: number): string {
  if (!Number.isFinite(points)) {
    throw new RangeError(`Percent format requires a finite number: ${points}`);
  }
  const rounded = (Math.round(points * 10) / 10).toFixed(1);
  return `${toFaDigits(rounded).replace('.', '٫')}٪`;
}

export function formatRatioAsPercent(ratio: number): string {
  if (!Number.isFinite(ratio)) {
    throw new RangeError(`Ratio format requires a finite number: ${ratio}`);
  }
  return formatPercentPoints(ratio * 100);
}

export function formatBillionsRial(n: number): string {
  if (!Number.isFinite(n)) {
    throw new RangeError(`Billion format requires a finite number: ${n}`);
  }
  return `${formatBillionsFigure(n)} میلیارد ریال`;
}

/** Persian billions figure only (no unit) — safe for tight SVG markers. */
export function formatBillionsFigure(n: number): string {
  if (!Number.isFinite(n)) {
    throw new RangeError(`Billion figure requires a finite number: ${n}`);
  }
  const billions = n / 1_000_000_000;
  const rounded = (Math.round(billions * 100) / 100).toFixed(2);
  return toFaDigits(rounded).replace('.', '٫');
}
