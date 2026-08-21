'use client';

import { useCallback, useEffect, useState } from 'react';

export type InViewOnceOptions = {
  /** Fraction of the target that must be visible (0–1). */
  threshold?: number;
  /**
   * IntersectionObserver rootMargin. Keep vertical margins at 0 (or slightly
   * negative) so below-the-fold charts do not start motion before they are seen.
   */
  rootMargin?: string;
};

const DEFAULTS: Required<InViewOnceOptions> = {
  threshold: 0.2,
  rootMargin: '0px',
};

function normalizeOptions(input?: number | InViewOnceOptions): Required<InViewOnceOptions> {
  if (typeof input === 'number') {
    return { threshold: input, rootMargin: DEFAULTS.rootMargin };
  }
  return {
    threshold: input?.threshold ?? DEFAULTS.threshold,
    rootMargin: input?.rootMargin ?? DEFAULTS.rootMargin,
  };
}

/**
 * One-shot in-view flag for scroll-triggered motion.
 *
 * Invariant: the observed node must keep a non-zero intersection box while
 * waiting (do not rest-state clip/hide the same node — that deadlocks IO).
 * AreaLine keeps clip open at rest; Columns observe a sized track, not empty ink.
 *
 * Uses a callback ref so the observer attaches when the node mounts (avoids
 * a null-ref effect that never re-subscribes on mobile).
 */
export function useInViewOnce<T extends Element>(options?: number | InViewOnceOptions) {
  const { threshold, rootMargin } = normalizeOptions(options);
  const [node, setNode] = useState<T | null>(null);
  const [active, setActive] = useState(false);

  const ref = useCallback((el: T | null) => {
    setNode(el);
  }, []);

  useEffect(() => {
    if (!node || active) return;

    if (typeof window === 'undefined') {
      setActive(true);
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setActive(true);
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      setActive(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setActive(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [node, active, threshold, rootMargin]);

  return { ref, active };
}
