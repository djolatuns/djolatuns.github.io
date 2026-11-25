const CACHE_VERSION = 'olatuns-shell-v2';
const SHELL_FILES = [
  './', './index.html', './styles.css', './app-core.js', './app-cloud.js',
  './manifest.webmanifest', './icon.svg', './icon-192.svg', './icon-512.svg',
  './download.html'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION);
    await cache.addAll(SHELL_FILES);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE_VERSION).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(request);
        const cache = await caches.open(CACHE_VERSION);
        cache.put('./index.html', fresh.clone()).catch(() => {});
        return fresh;
      } catch {
        return (await caches.match('./index.html')) || (await caches.match('./'));
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(CACHE_VERSION);
        cache.put(request, response.clone()).catch(() => {});
      }
      return response;
    } catch {
      return cached || Response.error();
    }
  })());
});
