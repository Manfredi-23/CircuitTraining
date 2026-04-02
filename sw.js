// =============================================================================
// sw.js — Service Worker for 7Bit PWA
// Cache-first for assets, network-first for data
// =============================================================================

const CACHE_NAME = '7bit-v1';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/config.js',
  './js/data-home.js',
  './js/data-cave.js',
  './js/data-hang.js',
  './js/engine.js',
  './js/ui.js',
  './js/timer.js',
  './js/stats.js',
  './js/app.js',
  './assets/home-pushups.png',
  './assets/home-pullups.png',
  './assets/home-squats.png',
  './assets/cave-kettlebell.png',
  './assets/cave-dumbbell.png',
  './assets/cave-barbell.png',
  './assets/fingers-maxhangs.png',
  './assets/fingers-hangboard.png',
  'https://fonts.googleapis.com/css2?family=Kode+Mono:wght@400;500;600;700&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('7Bit SW: some assets failed to cache', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    }).catch(() => {
      return caches.match('./index.html');
    })
  );
});
