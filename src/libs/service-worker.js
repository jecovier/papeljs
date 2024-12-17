// service-worker.js
const CACHE_NAME = "papel-cache-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Cache opened:", CACHE_NAME);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((cachedResponse) => {
        // Serve the cached version immediately if available
        if (cachedResponse) {
          console.log(`Serving from cache: ${event.request.url}`);
          // Update the cache in the background
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse.ok) {
                const clonedResponse = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, clonedResponse);
                  console.log(`Page updated in cache: ${event.request.url}`);
                });
              }
            })
            .catch((error) => {
              console.error("Background update failed:", error);
            });
          return cachedResponse;
        }

        // If no cache is found, fetch from network
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse.ok) {
            const clonedResponse = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clonedResponse);
              console.log(`Page cached: ${event.request.url}`);
            });
          }
          return networkResponse;
        });
      })
      .catch((error) => {
        // Handle errors or fallback to cache if offline
        console.error(
          "Fetch failed; returning offline fallback if available:",
          error
        );
        return caches.match(event.request);
      })
  );
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
