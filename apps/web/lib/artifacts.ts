import fs from 'node:fs';
import path from 'node:path';
import {
  parseManifestArtifact,
  parseMerchantArtifact,
  parsePlatformArtifact,
  type ManifestArtifactParsed,
  type MerchantArtifactParsed,
  type PlatformArtifactParsed,
} from '@zarinpulse/contracts';

/** Prefer env for Docker/Liara; else discover first tree that has platform.json. */
let cachedRoot: string | null = null;

export function getArtifactRoot(): string {
  if (cachedRoot) return cachedRoot;

  const fromEnv = process.env.ARTIFACTS_ROOT?.trim();
  if (fromEnv) {
    const resolved = path.resolve(fromEnv);
    if (!fs.existsSync(path.join(resolved, 'platform.json'))) {
      throw new Error(`ARTIFACTS_ROOT missing platform.json: ${resolved}`);
    }
    cachedRoot = resolved;
    return cachedRoot;
  }

  const candidates = [
    path.resolve(process.cwd(), '..', '..', 'data', 'artifacts'),
    path.resolve(process.cwd(), 'data', 'artifacts'),
    path.resolve(process.cwd(), 'public', 'artifacts'),
    path.resolve(process.cwd(), 'apps', 'web', 'public', 'artifacts'),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, 'platform.json'))) {
      cachedRoot = dir;
      return cachedRoot;
    }
  }
  throw new Error('artifacts not built; run npm run data:build (or set ARTIFACTS_ROOT)');
}

/** Test/ops helper — clears memoized root. */
export function resetArtifactRootCache(): void {
  cachedRoot = null;
}

function readRawJson(relativePath: string): unknown {
  const full = path.join(getArtifactRoot(), ...relativePath.split('/'));
  const raw = fs.readFileSync(full, 'utf8');
  return JSON.parse(raw) as unknown;
}

/**
 * Untyped escape hatch for rare artifact files.
 * Prefer readMerchantArtifact / readPlatformArtifact for hot paths.
 */
export function readArtifact<T>(relativePath: string): T {
  return readRawJson(relativePath) as T;
}

export function tryReadArtifact<T>(relativePath: string): T | null {
  try {
    return readArtifact<T>(relativePath);
  } catch {
    return null;
  }
}

export type PlatformArtifact = PlatformArtifactParsed;
export type MerchantArtifact = MerchantArtifactParsed;
export type ManifestArtifact = ManifestArtifactParsed;

export function readPlatformArtifact(): PlatformArtifact {
  return parsePlatformArtifact(readRawJson('platform.json'));
}

export function tryReadPlatformArtifact(): PlatformArtifact | null {
  try {
    return readPlatformArtifact();
  } catch {
    return null;
  }
}

export function readMerchantArtifact(key: string): MerchantArtifact {
  if (!/^[A-Za-z0-9_-]{1,32}$/.test(key)) {
    throw new Error(`invalid merchant key: ${key}`);
  }
  return parseMerchantArtifact(readRawJson(`merchants/${key}.json`));
}

/** Missing file → null. Corrupt/invalid schema → throws (caller maps to 500). */
export function tryReadMerchantArtifact(key: string): MerchantArtifact | null {
  if (!/^[A-Za-z0-9_-]{1,32}$/.test(key)) return null;
  const relative = `merchants/${key}.json`;
  const full = path.join(getArtifactRoot(), ...relative.split('/'));
  if (!fs.existsSync(full)) return null;
  return parseMerchantArtifact(readRawJson(relative));
}

export function readManifestArtifact(): ManifestArtifact {
  return parseManifestArtifact(readRawJson('manifest.json'));
}

export type MerchantIndexRow = {
  key: string;
  category: string;
  sessions: number;
  verified: number;
  success_rate: number;
  revenue_rial: number;
  health: string;
  tier: 'rich' | 'limited' | 'sparse';
  recoverable_rial: number;
};

export type ReconArtifact = {
  no_attempt_plus_attempted: number;
  sessions_total: number;
  attempted_identity?: number;
  attempted?: number;
  terminal_sum?: number;
  revenue: number;
  category_revenue?: number;
  merchant_revenue?: number;
  month_revenue?: number;
  recoverable_sum: number;
  impact_sum?: number;
  fee_realized_rial?: number;
  fee_session_total?: number;
  verified_gap: number;
  sourceSha256: string;
};

export type PassportArtifact = {
  id: string;
  metricId: string;
  grain: string;
  sql: string;
  n: number;
  sourceSha256: string;
};

export type CaseRow = { key: string; family: string; impactRial: number };
