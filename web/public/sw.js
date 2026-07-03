/* Qtangl Command Center — minimal offline read shell.
 *
 * Strategy: network-first for navigations and API calls (never serve stale
 * evidence), with a small cache fallback so the shell renders offline. We
 * deliberately do NOT cache tenant API responses — signed evidence and
 * readiness data must always come from the network to stay honest.
 */
const CACHE = "qtangl-cc-shell-v1";
const SHELL_URLS = ["/command-center", "/offline"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL_URLS).catch(() => undefined))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never cache API / auth traffic — always hit the network.
  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy).catch(() => undefined));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/command-center")))
    );
    return;
  }

  // Static assets: stale-while-revalidate.
  if (/\.(?:js|css|woff2?|png|svg|webp|ico)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((response) => {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy).catch(() => undefined));
            return response;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
  }
});
