const CACHE_NAME = 'tank-time-v1';
const ASSETS = [
  '/tank_time/',
  '/tank_time/index.html',
  '/tank_time/manifest.json',
  '/tank_time/sw.js',
  '/tank_time/icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
