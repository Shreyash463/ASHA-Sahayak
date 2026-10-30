/**
 * ASHA Sahayak Service Worker
 * Enables 100% Offline PWA Triage and App Shell Caching.
 */

const CACHE_NAME = "asha-sahayak-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/static/styles.css",
  "/static/app.js",
  "/static/rules_engine.js",
  "/static/manifest.json",
  "/static/icons/icon-192.png",
  "/static/icons/icon-512.png",
  "/static/icons/icon.svg",
  "/api/i18n/mr",
  "/api/i18n/hi",
  "/api/i18n/en"
];

// Install: pre-cache app shell
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn("SW pre-cache warning:", err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Network first, fall back to cache for API; Cache first for static assets
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // For API triage/extract calls when offline: let client-side JS handle it via IndexedDB & AshaRulesEngine
  if (url.pathname.startsWith("/api/triage") && event.request.method === "POST") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({ offline: true, detail: "Network offline. Storing in local queue." }),
          { headers: { "Content-Type": "application/json" }, status: 503 }
        );
      })
    );
    return;
  }

  // Cache first for static files
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then(networkResponse => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          event.request.method === "GET" &&
          (url.pathname.startsWith("/static/") || url.pathname === "/" || url.pathname.startsWith("/api/i18n"))
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback for HTML navigation
        if (event.request.mode === "navigate") {
          return caches.match("/");
        }
      });
    })
  );
});
