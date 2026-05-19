// Rose Ly — minimal service worker for PWA install + offline shell.
// Keep it tiny: only cache the hub + critical assets, never the localStorage data.

// v2 — only pre-cache stable HTML entry points.
// Vite bundles JS/CSS with content-hash filenames; those are cached dynamically
// on first request via the fetch handler below, not pre-listed here.
const CACHE = 'rl-shell-v2';
const SHELL = [
  '/',
  '/index.html',
  '/ui_kits/tv-display/index.html',
  '/ui_kits/tv-display/jumaat.html',
  '/ui_kits/mobile-admin/index.html',
  '/ui_kits/setup-wizard/index.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Only cache GETs to our own origin
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  event.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      // Cache successful HTML/CSS/JS/image responses
      if (res.ok && /\.(html|css|js|png|svg|webp|webmanifest)$/.test(new URL(req.url).pathname)) {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(req, clone)).catch(() => {});
      }
      return res;
    }).catch(() => caches.match('/index.html')))
  );
});
