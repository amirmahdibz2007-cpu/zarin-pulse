import type { AiBriefAnswer } from './ai-brief-prompt';

export type AiBriefCacheStore = {
  get(key: string): AiBriefAnswer | null;
  set(key: string, answer: AiBriefAnswer): void;
};

/** Process-local TTL cache — single-instance only (documented in architecture.md). */
export function createAiBriefCache(options?: {
  ttlMs?: number;
  maxEntries?: number;
  now?: () => number;
}): AiBriefCacheStore {
  const ttlMs = options?.ttlMs ?? 15 * 60 * 1000;
  const maxEntries = options?.maxEntries ?? 200;
  const now = options?.now ?? Date.now;
  const map = new Map<string, { at: number; answer: AiBriefAnswer }>();

  return {
    get(key: string): AiBriefAnswer | null {
      const hit = map.get(key);
      if (!hit) return null;
      if (now() - hit.at > ttlMs) {
        map.delete(key);
        return null;
      }
      return hit.answer;
    },
    set(key: string, answer: AiBriefAnswer): void {
      map.set(key, { at: now(), answer });
      if (map.size > maxEntries) {
        const oldest = map.keys().next().value;
        if (oldest) map.delete(oldest);
      }
    },
  };
}
