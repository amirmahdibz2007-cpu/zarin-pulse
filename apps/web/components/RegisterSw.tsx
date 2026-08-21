'use client';

import { useEffect } from 'react';

export function RegisterSw() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    // Dev/HMR: never register — phones on LAN would keep a stale shell
    // and look "broken" while desktop DevTools mobile mode looks fine.
    if (process.env.NODE_ENV !== 'production') {
      void navigator.serviceWorker.getRegistrations().then((regs) => {
        for (const reg of regs) void reg.unregister();
      });
      if (typeof caches !== 'undefined') {
        void caches.keys().then((keys) => {
          for (const key of keys) {
            if (key.startsWith('zarinpulse-')) void caches.delete(key);
          }
        });
      }
      return;
    }
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Offline cache is best-effort; the app still runs without it.
    });
  }, []);
  return null;
}
