const CACHE_NAME = '7bit-v2';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './style.css',
  './config.js',
  './data-home.js',
  './data-cave.js',
  './data-hang.js',
  './engine.js',
  './ui.js',
  './timer.js',
  './stats.js',
  './app.js',
  './home-pushups.png',
  './home-pullups.png',
  './home-squats.png',
  './cave-kettlebell.png',
  './cave-dumbbell.png',
  './cave-barbell.png',
  './fingers-maxhangs.png',
  './fingers-hangboard.png',
  './logo.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(STATIC_ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
      .catch(() => caches.match('./index.html'))
  );
});
