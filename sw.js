const CACHE_NAME = 'tank-time-v2';
const ASSETS = [
  '/tank_time/',
  '/tank_time/index.html',
  '/tank_time/manifest.json',
  '/tank_time/sw.js',
  '/tank_time/icon.png'
];

// Install Event - Pre-cache essential files
self.addEventListener('install', (e) => {
  // Force the waiting service worker to become active immediately
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Activate Event - Clean up old cache versions (v1, etc.)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // Immediately take control of open tabs
  );
});

// Fetch Event - Network-first for HTML, fallback to cache
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        // If network request succeeds, update the cache copy in the background
        if (networkResponse && networkResponse.status === 200 && e.request.method === 'GET') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache if offline
        return caches.match(e.request);
      })
  );
});
