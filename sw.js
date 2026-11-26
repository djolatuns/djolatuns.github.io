const CACHE_VERSION = 'olatuns-shell-v28';
const SHELL_FILES = [
  './', './index.html', './styles.css?v=14', './app-core.js?v=9',
  './app-cloud.js?v=16','./app-experience.js?v=11', './manifest.webmanifest', './icon.svg',
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


self.addEventListener('push', event => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; }
  catch (_) { payload = { body: event.data ? event.data.text() : '' }; }
  const title = payload.title || 'DJ OLATUNS';
  const options = {
    body: payload.body || 'You have a new update.',
    icon: payload.icon || './icon-192.svg',
    badge: payload.badge || './icon-192.svg',
    tag: payload.tag || 'dj-olatuns-update',
    data: { url: payload.url || './' },
    renotify: false
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || './', self.location.origin).href;
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of windows) {
      if (client.url.startsWith(self.location.origin) && 'focus' in client) {
        await client.navigate(target);
        return client.focus();
      }
    }
    return self.clients.openWindow(target);
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
