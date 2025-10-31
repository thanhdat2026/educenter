const CACHE_NAME = 'educenter-pro-cache-v1';
// Define the files that make up the "app shell"
const APP_SHELL_URLS = [
  './', // Caching the root is important for PWA launch
  './index.html', // The main app shell
  './logo.svg',   // The app icon
];

// Install event: cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching App Shell');
        // Use addAll to atomically cache all essential files
        return cache.addAll(APP_SHELL_URLS);
      })
      .catch(error => {
        console.error('Failed to cache app shell:', error);
      })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event: implements a network-first, falling back to cache strategy,
// and properly handles SPA routing for 404s.
self.addEventListener('fetch', (event) => {
  // We only want to handle GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      
      // Try to fetch from the network first to get the freshest content.
      try {
        const networkResponse = await fetch(event.request);

        // If the response is good (status 200-299), cache it and return it.
        if (networkResponse.ok) {
          if (event.request.url.startsWith('http')) {
            await cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }

        // If the network returns a 404 or other server error for a navigation request,
        // it's an SPA route that the server doesn't know about. Serve the app shell.
        if (event.request.mode === 'navigate') {
          console.log(`Service Worker: Network returned status ${networkResponse.status} for navigation. Serving index.html from cache.`);
          const indexResponse = await cache.match('./index.html');
          // If index.html is in the cache, return it, otherwise let the browser show the server's error page.
          return indexResponse || networkResponse; 
        }
        
        // For other failed non-navigation requests (e.g., a missing image), return the failed response.
        return networkResponse;

      } catch (error) {
        // This block runs when the network request itself fails (e.g., user is offline).
        console.log('Service Worker: Network fetch failed. Trying cache.', event.request.url);
        
        // Try to find a match in the cache.
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // If it was a navigation request and it's not in the cache,
        // serve the main index.html file as a fallback.
        if (event.request.mode === 'navigate') {
          console.log('Service Worker: Not in cache either. Serving index.html as fallback for offline navigation.');
          const indexResponse = await cache.match('./index.html');
          return indexResponse;
        }
        
        // If it's another type of request and not in cache, the request fails.
        // This is the expected behavior for missing assets when offline.
        // We must return a Response object from the catch block.
        return new Response("Network error: The resource is not available in the cache.", {
          status: 408,
          headers: { "Content-Type": "text/plain" },
        });
      }
    })()
  );
});
