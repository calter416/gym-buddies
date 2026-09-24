// Gym Buddies service worker: keeps the app working with no internet.
// Bump VERSION when app files change so phones pick up the new version.
const VERSION = 'v5';
const CACHE = 'gym-buddies-' + VERSION;
const SHELL = [
  './',
  './index.html',
  './app.js',
  './avatars.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];
const NETWORK_TIMEOUT_MS = 3000;

// The app asks "is everything saved for offline?" to show a Ready badge.
self.addEventListener('message', (event) => {
  if (event.data !== 'offline-status') return;
  event.waitUntil(caches.open(CACHE).then(async (cache) => {
    const missing = [];
    for (const u of SHELL) if (!(await cache.match(u, { ignoreSearch: true }))) missing.push(u);
    event.source.postMessage({ type: 'offline-status', version: VERSION, ready: missing.length === 0, missing });
  }));
});

self.addEventListener('install', (event) => {
  // cache: 'reload' skips the browser's HTTP cache so we never store stale copies.
  event.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(SHELL.map((u) => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
  });
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Fonts and other outside files: use the saved copy, fetch once if missing.
  if (url.origin !== self.location.origin) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const hit = await cache.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
        return res;
      })
    );
    return;
  }

  // App files: get the newest version when online, fall back to the saved copy at the gym.
  const isPage = req.mode === 'navigate' || req.destination === 'document';
  const key = isPage ? './index.html' : url.pathname;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      // Fetch by URL (not the original request) so iPhones don't reject the options on page loads.
      const res = await withTimeout(fetch(url.href, { cache: 'no-cache' }), NETWORK_TIMEOUT_MS);
      if (res && res.ok && !res.redirected) cache.put(key, res.clone());
      if (res && res.ok) return res;
      throw new Error('bad response');
    } catch (e) {
      const hit = (await cache.match(key, { ignoreSearch: true }))
        || (isPage && ((await cache.match('./', { ignoreSearch: true })) || (await caches.match('./index.html', { ignoreSearch: true }))))
        || (await caches.match(req, { ignoreSearch: true }));
      if (hit) return hit;
      return new Response('<!doctype html><meta name="viewport" content="width=device-width"><body style="font-family:system-ui;padding:40px;text-align:center;background:#F4F1FF;color:#251E4D"><h2>Gym Buddies isn’t saved for offline yet</h2><p>Open it once with internet, then it will work at the gym.</p>',
        { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }
  })());
});
