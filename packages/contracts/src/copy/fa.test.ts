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

  it('names day and night themes', () => {
    expect(copy.palette.sand.length).toBeGreaterThan(0);
    expect(copy.palette.noir.length).toBeGreaterThan(0);
    expect(copy.palette.toDark.length).toBeGreaterThan(0);
    expect(copy.palette.toLight.length).toBeGreaterThan(0);
    expect(copy.preview.hint.length).toBeGreaterThan(0);
  });

  it('covers merchant home periods', () => {
    expect(copy.homeMerchant.sales.length).toBeGreaterThan(0);
    expect(copy.homeMerchant.period.month.length).toBeGreaterThan(0);
    expect(copy.homeMerchant.period.year.length).toBeGreaterThan(0);
    expect(forbiddenTechnicalInPlain(copy.homeMerchant.periodPartial)).toEqual([]);
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
    expect(copy.actionBrief.pendingBody).toContain('{amount}');
    expect(copy.actionBrief.recoverableClause).toContain('{recoverable}');
    expect(copy.actionBrief.nextLabel.length).toBeGreaterThan(0);
    expect(copy.actionBrief.inBankNext.length).toBeGreaterThan(0);
    expect(forbiddenTechnicalInPlain(copy.actionBrief.peerBody)).toEqual([]);
    expect(copy.codeMap.title.length).toBeGreaterThan(0);
    expect(copy.codeMap.layers.webTitle.length).toBeGreaterThan(0);
  });

  it('names the locked baseline and lab samples', () => {
    expect(copy.version.one).toContain('۱');
    expect(copy.lab.title.length).toBeGreaterThan(0);
    expect(copy.lab.aTitle.length).toBeGreaterThan(0);
    expect(copy.pipeline.title.length).toBeGreaterThan(0);
    expect(copy.pipeline.next.length).toBeGreaterThan(0);
    expect(copy.pipeline.steps.ingestTitle.length).toBeGreaterThan(0);
  });
});
