# Architecture (ZarinPulse)

Offline-first analytics for ZarinPal merchants. Numbers are derived once in ETL, committed as hashed JSON artifacts, and consumed by the Next.js app — no DuckDB in production.

## Package graph

```
contracts          brands, FA copy, formatters, Zod wire schemas (artifacts)
   ↑
analytics          pure numeric engines (Wilson, recoverable sales, …)
   ↑
etl                DuckDB → golden asserts → data/artifacts (+ sync public/)
insights           classifyGateway (must stay SQL-parity tested)
calendar           occasion helpers (tests / future)

contracts ← web    Next.js UI + /api/* — eslint forbids importing etl/analytics/calendar
```

## Artifact boundary

- Source of truth: `data/artifacts` (ETL). Deploy mirror: `apps/web/public/artifacts`.
- Override root with `ARTIFACTS_ROOT` (absolute path). Otherwise the first existing candidate with `platform.json` wins (memoized).
- Hot paths parse with Zod (`parseMerchantArtifact` / `parsePlatformArtifact`). Unknown keys are stripped at the boundary. Untyped `readArtifact<T>` is an escape hatch only.
- Full merchant JSON does **not** include index-only fields `tier` / `recoverable_rial` (those live on `merchants-index.json`). Impact expected is on `impact.expected`.

## Grain & integrity

- Session is the grain of truth (not try rows).
- Golden locks in `packages/etl` + `npm run data:verify` (manifest file hashes + `sourceSha256`).
- `adjusted_fee` is relative-only — never presented as ZarinPal’s real tariff.

## AI brief (`POST /api/ai-brief`)

```
merchant artifact
  → buildLockedForMerchant (metrics + dossier + ranked actions)
  → OpenRouter race (optional) → validate/repair
  → deterministic / grounded fallback
```

- Model must not invent digits; validation allowlists digits from the locked JSON.
- Orchestration: `lib/ai-brief-service.ts` (injectable deps). Route is thin I/O.
- Recipe responses cached in-process (15m TTL, ~200 keys) — **not** multi-instance safe.
- Structured log: `{ scope: "ai_brief", errorId, merchantKey, promptId, source, model?, cacheHit, latencyMs }`.
- Stable errors: `invalid_merchant | invalid_prompt | invalid_message | merchant_not_found | invalid_merchant_artifact | ai_brief_failed`.

## Gateway health

- Labels written by ETL SQL `gateway_health`.
- `packages/insights.classifyGateway` mirrors that CASE; `gateway-health-parity.test.ts` asserts equality on a sample of committed merchants.

## Ops

```bash
npm run data:build    # rebuild artifacts
npm run data:verify   # hash replay
npm run verify        # full gate
ARTIFACTS_ROOT=/path/to/artifacts npm run start
```
