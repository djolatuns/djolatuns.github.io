const CACHE_NAME = "olatuns-world-pwa-v1";
const BASE = new URL("./", self.location.href);
const APP_SHELL = [
  new URL("./", BASE).pathname,
  new URL("./index.html", BASE).pathname,
  new URL("./manifest.webmanifest", BASE).pathname,
  new URL("./olatuns-world-icon.svg", BASE).pathname
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(APP_SHELL.map(async path => {
      try {
        const response = await fetch(path, { credentials: "same-origin" });
        if (response && response.ok) await cache.put(path, response);
      } catch (error) {
        console.warn("OLATUNS WORLD could not cache:", path, error);
      }
    }));
  })());
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith("olatuns-world-pwa-") && key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(BASE.pathname)) return;
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      }).catch(async () => (await caches.match(event.request)) || (await caches.match(new URL("./index.html", BASE).pathname)) || Response.error())
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      if (response && response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      }
      return response;
    }))
  );
});
