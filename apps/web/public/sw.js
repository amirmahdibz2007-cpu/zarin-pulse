const CACHE_FALLBACK = 'zarinpulse-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

async function cacheName() {
  try {
    const res = await fetch('/artifacts/manifest.json');
    if (!res.ok) return CACHE_FALLBACK;
    const body = await res.json();
    return `zarinpulse-${String(body.sourceSha256).slice(0, 16)}`;
  } catch {
    return CACHE_FALLBACK;
  }
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.pathname.startsWith('/api/')) return;
  const isArtifact =
    url.pathname.startsWith('/artifacts/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.webmanifest');
  if (isArtifact) {
    event.respondWith(
      cacheName().then(async (name) => {
        const cache = await caches.open(name);
        const hit = await cache.match(req);
        if (hit) return hit;
        const fresh = await fetch(req);
        cache.put(req, fresh.clone());
        return fresh;
      }),
    );
    return;
  }
  event.respondWith(
    fetch(req)
      .then(async (fresh) => {
        const name = await cacheName();
        const cache = await caches.open(name);
        cache.put(req, fresh.clone());
        return fresh;
      })
      .catch(async () => {
        const name = await cacheName();
        const cache = await caches.open(name);
        const hit = await cache.match(req);
        if (hit) return hit;
        return caches.match('/offline.html');
      }),
  );
});
