// Gym Buddies service worker: keeps the app working with no internet.
// Bump VERSION when app files change so phones pick up the new version.
const VERSION = 'v3';
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
  const key = req.mode === 'navigate' ? './index.html' : req;
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      try {
        const res = await withTimeout(fetch(req, { cache: 'no-cache' }), NETWORK_TIMEOUT_MS);
        if (res && res.ok) cache.put(key, res.clone());
        return res;
      } catch (e) {
        const hit = await cache.match(key, { ignoreSearch: true });
        return hit || Response.error();
      }
    })
  );
});
