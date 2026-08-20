'use client';

import { useEffect } from 'react';
import { DEFAULT_PALETTE } from '../lib/palette';

/** Preview-only: forces noir while mounted; restores previous palette on leave. */
export function LabDarkHost({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    const prev = root.getAttribute('data-palette') || DEFAULT_PALETTE;
    root.setAttribute('data-palette', 'noir');
    root.setAttribute('data-lab-dark', '1');
    return () => {
      root.setAttribute('data-palette', prev);
      root.removeAttribute('data-lab-dark');
    };
  }, []);

  return <>{children}</>;
}
