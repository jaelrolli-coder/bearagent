// Bearagent service worker — offline-first cache for the kids' shell.
// Cache strategy:
//   - HTML / CSS / JS / icons:  cache-first with background revalidate
//   - content/*.json:           network-first (so daily updates show up)
//   - everything else (YouTube, RSS thumbnails, etc): network-only
//
// Bump CACHE_VERSION whenever assets change non-backwards-compatibly.

const CACHE_VERSION = 'bearagent-v1';
const PRECACHE = [
  '/bearagent/',
  '/bearagent/index.html',
  '/bearagent/manifest.webmanifest',
  '/bearagent/assets/css/style.css',
  '/bearagent/assets/img/icon.svg',
  '/bearagent/js/i18n.js',
  '/bearagent/js/picker.js',
  '/bearagent/js/profile.js',
  '/bearagent/js/tiles.js',
  '/bearagent/js/tts.js',
  '/bearagent/js/timer.js',
  '/bearagent/js/parent.js',
  '/bearagent/js/register-sw.js',
  '/bearagent/kid/noa.html',
  '/bearagent/kid/nina.html',
  '/bearagent/kid/word.html',
  '/bearagent/kid/fact.html',
  '/bearagent/kid/news.html',
  '/bearagent/kid/schedule.html',
  '/bearagent/kid/emergency.html',
  '/bearagent/kid/sudoku.html',
  '/bearagent/kid/videos.html',
  '/bearagent/js/word.js',
  '/bearagent/js/fact.js',
  '/bearagent/js/news.js',
  '/bearagent/js/schedule.js',
  '/bearagent/js/emergency.js',
  '/bearagent/js/sudoku.js',
  '/bearagent/js/videos.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Don't intercept third-party (YouTube, BBC thumbnails, etc).
  if (url.origin !== self.location.origin) return;

  // content/*.json: network-first so daily updates surface immediately.
  if (url.pathname.startsWith('/bearagent/content/') && url.pathname.endsWith('.json')) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(event.request, copy));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Everything same-origin: cache-first, revalidate in background.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(event.request, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
