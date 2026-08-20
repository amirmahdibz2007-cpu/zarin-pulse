'use client';

import { coercePalette, PALETTE_STORAGE_KEY, PREVIEW_PALETTE } from '../lib/palette';
import { useEffect } from 'react';

export function MixPreviewLock() {
  useEffect(() => {
    document.documentElement.setAttribute('data-palette', PREVIEW_PALETTE);
    return () => {
      let next = coercePalette(null);
      try {
        next = coercePalette(localStorage.getItem(PALETTE_STORAGE_KEY));
      } catch {
        // Private mode can block storage; fall back to the product default.
      }
      document.documentElement.setAttribute('data-palette', next);
    };
  }, []);
  return null;
}
