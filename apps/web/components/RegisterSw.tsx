'use client';

import { useEffect } from 'react';

export function RegisterSw() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Offline cache is best-effort; the app still runs without it.
    });
  }, []);
  return null;
}
