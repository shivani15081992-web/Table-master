const CACHE_NAME = 'tablemaster-v4';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './staff.html',
  './pos.html',
  './kitchen.html',
  './bills.html',
  './reports.html',
  './expenses.html',
  './platforms.html',
  './menu.html',
  './customer.html',
  './shared.css',
  './shared.js',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
