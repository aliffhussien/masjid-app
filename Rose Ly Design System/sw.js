// Rose Ly — minimal service worker for PWA install + offline shell.
// Keep it tiny: only cache the hub + critical assets, never the localStorage data.

const CACHE = 'rl-shell-v1';
const SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/colors_and_type.css',
  '/assets/logo-mark.png',
  '/assets/favicon.png',
  '/shared/state.js',
  '/shared/i18n.js',
  '/shared/solat.js',
  '/shared/news.js',
  '/shared/ticker.js',
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
