import { describe, expect, it } from 'vitest';
import { count } from '../brands';
import {
  formatBillionsRial,
  formatCount,
  formatPercentPoints,
  formatRatioAsPercent,
  formatRial,
} from './number';

describe('formatCount / formatRial', () => {
  it('groups thousands and uses Persian digits', () => {
    expect(formatCount(count(1_025_655))).toBe('۱٬۰۲۵٬۶۵۵');
    expect(formatRial(1_920)).toBe('۱٬۹۲۰ ریال');
  });

  it('formats zero', () => {
    expect(formatCount(count(0))).toBe('۰');
    expect(formatRial(0)).toBe('۰ ریال');
  });
});

describe('percent', () => {
  it('prints one decimal with the Persian percent sign', () => {
    expect(formatPercentPoints(54.81)).toBe('۵۴٫۸٪');
    expect(formatRatioAsPercent(0.4972)).toBe('۴۹٫۷٪');
  });
});

describe('billions', () => {
  it('divides by 1e9', () => {
    expect(formatBillionsRial(88_920_000_000)).toBe('۸۸٫۹۲ میلیارد ریال');
  });
});
