import { describe, expect, it } from 'vitest';
import { copy, forbiddenTechnicalInPlain } from './fa';

describe('copy deck', () => {
  it('names the product in Persian', () => {
    expect(copy.product.name).toContain('زرین');
  });

  it('covers every terminal state', () => {
    expect(copy.terminal.Verified.length).toBeGreaterThan(0);
    expect(copy.terminal.InBank.length).toBeGreaterThan(0);
    expect(copy.terminal.NoAttempt.length).toBeGreaterThan(0);
    expect(copy.terminal.Failed.length).toBeGreaterThan(0);
    expect(copy.terminal.Paid.length).toBeGreaterThan(0);
    expect(copy.terminal.Reversed.length).toBeGreaterThan(0);
    expect(Object.keys(copy.terminalShort)).toEqual(Object.keys(copy.terminal));
  });

  it('keeps layer-one product strings free of technical jargon', () => {
    expect(forbiddenTechnicalInPlain(copy.product.tagline)).toEqual([]);
    expect(forbiddenTechnicalInPlain(copy.product.skeletonNote)).toEqual([]);
    expect(forbiddenTechnicalInPlain(copy.captureNote)).toEqual([]);
  });

  it('covers thirteen hypotheses', () => {
    expect(Object.keys(copy.hypotheses)).toHaveLength(13);
    expect(Object.keys(copy.hypothesisDetail)).toHaveLength(13);
  });

  it('names three chrome palettes', () => {
    expect(copy.palette.pearl.length).toBeGreaterThan(0);
    expect(copy.palette.aurum.length).toBeGreaterThan(0);
    expect(copy.palette.ice.length).toBeGreaterThan(0);
    expect(copy.palette.sand.length).toBeGreaterThan(0);
    expect(copy.preview.hint.length).toBeGreaterThan(0);
  });

  it('covers dashboard chart labels', () => {
    expect(copy.dash.funnel.length).toBeGreaterThan(0);
    expect(copy.dash.weekCols.length).toBeGreaterThan(0);
    expect(copy.dash.weekScale.length).toBeGreaterThan(0);
    expect(copy.dash.opened.length).toBeGreaterThan(0);
    expect(copy.dash.pending.length).toBeGreaterThan(0);
    expect(copy.dash.merchant.length).toBeGreaterThan(0);
  });

  it('keeps nav labels free of PSP jargon', () => {
    expect(copy.nav.psp.includes('PSP')).toBe(false);
    expect(copy.nav.hide.length).toBeGreaterThan(0);
    expect(copy.nav.show.length).toBeGreaterThan(0);
  });

  it('covers action brief copy', () => {
    expect(copy.actionBrief.copy.length).toBeGreaterThan(0);
    expect(copy.actionBrief.pendingTitle.length).toBeGreaterThan(0);
    expect(copy.actionBrief.feeTitle.length).toBeGreaterThan(0);
    expect(copy.actionBrief.limitNote.length).toBeGreaterThan(0);
  });
});
