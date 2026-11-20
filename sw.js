/* Remove stale prototype caches and retire the old service worker. */
self.addEventListener('install',event=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const names=await caches.keys();
 await Promise.all(names.map(name=>caches.delete(name)));
 await self.clients.claim();
 await self.registration.unregister();
})()));
