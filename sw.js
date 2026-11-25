const CACHE_VERSION = 'olatuns-shell-v13';
const SHELL_FILES = [
  './', './index.html', './styles.css?v=8', './app-core.js?v=5',
  './app-cloud.js?v=11', './manifest.webmanifest', './icon.svg',
  './icon-192.svg', './icon-512.svg', './download.html','./booking.html','./admin.html','./admin-upload.html'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION);
    await Promise.all(SHELL_FILES.map(async path => {
      try {
        const response = await fetch(path, { cache: 'reload' });
        if (response.ok) await cache.put(path, response);
      } catch (_) {}
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('olatuns-shell-') && key !== CACHE_VERSION).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_VERSION);
    try {
      const response = await fetch(request, { cache: 'no-cache' });
      if (response && response.ok) await cache.put(request, response.clone());
      return response;
    } catch (_) {
      const cached = await caches.match(request) || await caches.match(new URL(request.url).pathname);
      if (cached) return cached;
      if (request.mode === 'navigate') return (await caches.match('./index.html')) || (await caches.match('./'));
      return Response.error();
    }
  })());
});
