const CACHE_NAME = 'tank-time-v3'; // Incremented to force full cache purge
const ASSETS = [
  '/tank_time/',
  '/tank_time/index.html',
  '/tank_time/manifest.json',
  '/tank_time/sw.js',
  '/tank_time/icon.png'
];

// Install Event - Pre-cache essential files
self.addEventListener('install', (e) => {
  self.skipWaiting(); // Instantly replace old waiting workers
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Activate Event - Clear old cache versions (v1, v2, etc.)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache); // Wipes out old cached version
          }
        })
      );
    }).then(() => self.clients.claim()) // Immediately take control of all active tabs
  );
});

// Fetch Event - Try network first, fall back to cache if offline
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && e.request.method === 'GET') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(e.request);
      })
  );
});
