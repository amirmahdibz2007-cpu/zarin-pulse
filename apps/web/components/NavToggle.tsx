'use client';

import { copy } from '@zarinpulse/contracts';
import { useEffect, useState } from 'react';
import { NAV_HIDDEN, NAV_STORAGE_KEY } from '../lib/nav-chrome';

function applyHidden(hidden: boolean) {
  if (hidden) {
    document.documentElement.setAttribute('data-nav', NAV_HIDDEN);
    try {
      localStorage.setItem(NAV_STORAGE_KEY, NAV_HIDDEN);
    } catch {
      // Private mode can block storage; the session still hides the rail.
    }
    return;
  }
  document.documentElement.removeAttribute('data-nav');
  try {
    localStorage.removeItem(NAV_STORAGE_KEY);
  } catch {
    // Same private-mode path as persist.
  }
}

export function NavToggle() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setHidden(document.documentElement.getAttribute('data-nav') === NAV_HIDDEN);
  }, []);

  const label = hidden ? copy.nav.show : copy.nav.hide;
  return (
    <button
      type="button"
      className="control-neuro hidden min-h-11 min-w-11 items-center justify-center lg:inline-flex"
      aria-pressed={hidden}
      aria-label={label}
      title={label}
      onClick={() => {
        const next = !hidden;
        setHidden(next);
        applyHidden(next);
      }}
    >
      <span className="nav-toggle-mark" data-hidden={hidden ? 'true' : 'false'} />
    </button>
  );
}
