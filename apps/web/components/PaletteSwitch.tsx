'use client';

import { copy } from '@zarinpulse/contracts';
import { coercePalette, DEFAULT_PALETTE, PALETTE_STORAGE_KEY, PALETTES, type PaletteId } from '../lib/palette';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

function applyPalette(id: PaletteId) {
  document.documentElement.setAttribute('data-palette', id);
  try {
    localStorage.setItem(PALETTE_STORAGE_KEY, id);
  } catch {
    // Private mode can block storage; the session still applies the palette.
  }
}

export function PaletteSwitch() {
  const pathname = usePathname();
  const [current, setCurrent] = useState<PaletteId>(DEFAULT_PALETTE);

  useEffect(() => {
    setCurrent(coercePalette(document.documentElement.getAttribute('data-palette')));
  }, []);

  if (pathname === '/preview') return null;

  return (
    <div className="flex items-center gap-1" role="group">
      {PALETTES.map((id) => (
        <button
          key={id}
          type="button"
          className="control-neuro inline-flex min-h-11 min-w-11 items-center justify-center"
          data-active={current === id ? 'true' : 'false'}
          aria-pressed={current === id}
          aria-label={copy.palette[id]}
          title={copy.palette[id]}
          onClick={() => {
            setCurrent(id);
            applyPalette(id);
          }}
        >
          <span className={`palette-dot palette-dot-${id}`} />
        </button>
      ))}
    </div>
  );
}
