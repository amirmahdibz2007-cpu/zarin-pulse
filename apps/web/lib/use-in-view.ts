'use client';

import { useEffect, useRef, useState } from 'react';

function isRoughlyVisible(node: Element): boolean {
  const rect = node.getBoundingClientRect();
  const vh = typeof window !== 'undefined' ? window.innerHeight : 0;
  return rect.bottom > 8 && rect.top < vh * 1.05;
}

/** Fires once when the element enters the viewport; then disconnects. */
export function useInViewOnce<T extends Element>(threshold = 0.12) {
  const ref = useRef<T | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || active) return;

    if (typeof window === 'undefined') {
      setActive(true);
      return;
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const narrow = window.matchMedia('(max-width: 700px)').matches;
    if (reduced || narrow || isRoughlyVisible(node)) {
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
      { threshold, rootMargin: '80px 0px 80px 0px' },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [active, threshold]);

  return { ref, active };
}
