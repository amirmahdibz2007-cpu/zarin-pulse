import fs from 'node:fs';
import path from 'node:path';
import { classifyGateway } from '@zarinpulse/insights';
import { describe, expect, it } from 'vitest';
import { getArtifactRoot, tryReadMerchantArtifact } from './artifacts';

/**
 * SQL `gateway_health` CASE and insights.classifyGateway must stay aligned.
 * Truth for product labels is the committed artifact `health` field (from ETL SQL).
 */
describe('gateway health parity (insights ↔ artifacts)', () => {
  it('matches classifyGateway to artifact health on a merchant sample', () => {
    const root = path.join(getArtifactRoot(), 'merchants');
    const files = fs
      .readdirSync(root)
      .filter((f) => /^M\d+\.json$/.test(f))
      .slice(0, 60);

    expect(files.length).toBeGreaterThan(10);

    const mismatches: { key: string; artifact: string; insights: string }[] = [];
    for (const file of files) {
      const key = file.replace(/\.json$/, '');
      const m = tryReadMerchantArtifact(key);
      expect(m, key).toBeTruthy();
      if (!m) continue;
      const classified = classifyGateway({
        sessions: m.sessions,
        verified: m.verified,
        noAttempt: m.no_attempt,
        paidPending: m.paid_pending,
      });
      if (classified !== m.health) {
        mismatches.push({ key: m.key, artifact: m.health, insights: classified });
      }
    }

    expect(mismatches).toEqual([]);
  });
});
