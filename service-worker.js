const CACHE_NAME = 'pranavam-academy-pwa-v5';
const CORE_ASSETS = [
  './',
  './index.html',
  './online-group-yoga.html',
  './therapeutic-yoga.html',
  './assets/style.css?v=54',
  './assets/config.js?v=54',
  './assets/app.js?v=54',
  './manifest.webmanifest',
  './assets/academy-logo.png',
  './assets/yoga-logo.png',
  './assets/images/hero-academy.jpg',
  './assets/images/online-yoga.jpg',
  './assets/images/karate.jpg',
  './assets/images/dance.jpg',
  './assets/images/music.jpg',
  './assets/images/drawing.jpg',
  './assets/images/teach-with-us.jpg',
  './assets/images/yoga-accessible.jpg',
  './assets/images/refer-friend.jpg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match('./index.html')));
    return;
  }

  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
      return res;
    }).catch(() => cached))
  );
});
