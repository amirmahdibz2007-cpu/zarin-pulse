'use client';

import { copy } from '@zarinpulse/contracts';
import {
  coercePalette,
  DARK_PALETTE,
  DEFAULT_PALETTE,
  PALETTE_STORAGE_KEY,
  togglePalette,
  type PaletteId,
} from '../lib/palette';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

function applyPalette(id: PaletteId) {
  document.documentElement.setAttribute('data-palette', id);
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) {
    themeMeta.setAttribute('content', id === DARK_PALETTE ? '#141210' : '#f8f4f0');
  }
  try {
    localStorage.setItem(PALETTE_STORAGE_KEY, id);
  } catch {
    // Private mode can block storage; the session still applies the palette.
  }
}

function MoonIcon() {
  return (
    <svg className="theme-toggle-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M21 14.3A8.5 8.5 0 0 1 9.7 3a7 7 0 1 0 11.3 11.3Z"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg className="theme-toggle-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.1 5.1l1.6 1.6M17.3 17.3l1.6 1.6M18.9 5.1l-1.6 1.6M6.7 17.3l-1.6 1.6" />
      </g>
    </svg>
  );
}

export function PaletteSwitch() {
  const pathname = usePathname();
  const [current, setCurrent] = useState<PaletteId>(DEFAULT_PALETTE);

  useEffect(() => {
    setCurrent(coercePalette(document.documentElement.getAttribute('data-palette')));
  }, []);

  if (pathname === '/preview') return null;

  const isDark = current === DARK_PALETTE;
  const label = isDark ? copy.palette.toLight : copy.palette.toDark;

  return (
    <button
      type="button"
      className="theme-toggle control-neuro"
      data-mode={isDark ? 'dark' : 'light'}
      aria-label={label}
      title={label}
      onClick={() => {
        const next = togglePalette(current);
        setCurrent(next);
        applyPalette(next);
      }}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
      <span className="theme-toggle-caption">{isDark ? copy.palette.noir : copy.palette.sand}</span>
    </button>
  );
}
