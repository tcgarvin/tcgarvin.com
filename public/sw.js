// The old Gatsby site registered an offline (Workbox) service worker at this
// path. Browsers periodically re-fetch it, so this replacement clears the old
// caches, unregisters itself, and reloads open tabs onto the live site.
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: "window" });
      for (const client of clients) client.navigate(client.url);
    })(),
  );
});
