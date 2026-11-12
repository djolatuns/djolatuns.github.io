const CACHE_NAME = "dj-olatuns-pwa-v51";

const APP_SHELL = [
  "/",
  "/index.html",
  "/members.html",
  "/mixtapes.html",
  "/community.html",
  "/status.html",
  "/announcements.html",
  "/account.html",
  "/settings.html",
  "/about.html",
  "/admin.html",
  "/booking.html",
  "/business-centre.html",
  "/business-chat.html",
  "/ai-assistant.html",
  "/dj-lessons.html",
  "/professional-serato-class.html",
  "/manifest.webmanifest",
  "/push-client.js",
  "/pwa.js",
  "/og-image.webp",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-circle.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Cache shell files individually: one missing/unsupported asset must not
    // prevent Safari or another browser from activating the whole app shell.
    await Promise.all(APP_SHELL.map(async (url) => {
      try {
        const response = await fetch(url, { credentials: "same-origin" });
        if (response && response.ok) await cache.put(url, response);
      } catch (error) {
        console.warn("DJ OLATUNS could not cache:", url, error);
      }
    }));
  })());
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key.startsWith("dj-olatuns-pwa-") && key !== CACHE_NAME).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;
  // Keep OLATUNS WORLD isolated from the DJ OLATUNS app cache and offline fallback.
  if (requestUrl.pathname === "/olatuns-world" || requestUrl.pathname.startsWith("/olatuns-world/")) return;
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      }).catch(async () => (await caches.match(event.request)) || (await caches.match("/index.html")) || Response.error())
    );
    return;
  }
  if (requestUrl.pathname === "/service-worker.js") {
    event.respondWith(fetch(event.request, { cache: "no-store" }));
    return;
  }
  event.respondWith(caches.match(event.request).then((cached) => {
    if (cached) return cached;
    return fetch(event.request).then((response) => {
      if (response && response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      }
      return response;
    });
  }));
});

self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) {}
  event.waitUntil(self.registration.showNotification(data.title || "DJ OLATUNS", {
    body: data.body || "You have a new DJ OLATUNS announcement.",
    icon: "/icon-circle.svg",
    badge: "/icon-192.png",
    data: { url: data.url || "/#updates" },
    tag: "dj-olatuns-announcement",
    renotify: true
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/#updates", self.location.origin).href;
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of windows) {
      if (client.url.startsWith(self.location.origin) && "focus" in client) {
        await client.navigate(target);
        return client.focus();
      }
    }
    return self.clients.openWindow(target);
  })());
});
