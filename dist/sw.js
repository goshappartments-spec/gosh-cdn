/**
 * gosh.rent Service Worker
 * Handles caching strategies for performance
 * Version: 1.0.0
 */

const CACHE_VERSION = 'v1';
const CACHE_NAMES = {
  CRITICAL: `gosh-critical-${CACHE_VERSION}`,
  STATIC: `gosh-static-${CACHE_VERSION}`,
  TRAVELLINE: `gosh-travelline-${CACHE_VERSION}`,
  PAGES: `gosh-pages-${CACHE_VERSION}`
};

const CRITICAL_ASSETS = [
  '/dist/critical.css',
  '/dist/script-optimizer.js'
];

const STATIC_DOMAINS = ['static.tildacdn.com', 'cdn.jsdelivr.net'];
const TRAVELLINE_DOMAINS = ['ru-ibe.tlintegration.ru'];

/**
 * Install event - pre-cache critical assets
 */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAMES.CRITICAL)
      .then(cache => {
        return cache.addAll(CRITICAL_ASSETS)
          .then(() => self.skipWaiting())
          .catch(err => {
            console.log('[SW] Failed to cache critical assets:', err);
            return self.skipWaiting();
          });
      })
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!Object.values(CACHE_NAMES).includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

/**
 * Determine cache strategy based on request
 */
function getCacheStrategy(url) {
  const urlObj = new URL(url);
  const hostname = urlObj.hostname;
  const pathname = urlObj.pathname;

  // Critical assets - cache first
  if (CRITICAL_ASSETS.some(asset => pathname.includes(asset))) {
    return 'cache-first';
  }

  // Static assets - cache first
  if (STATIC_DOMAINS.some(domain => hostname.includes(domain))) {
    if (pathname.match(/\.(js|css|woff|woff2|ttf|eot|svg|png|jpg|jpeg|gif|webp)$/i)) {
      return 'cache-first';
    }
  }

  // TravelLine API - stale while revalidate
  if (TRAVELLINE_DOMAINS.some(domain => hostname.includes(domain))) {
    return 'stale-while-revalidate';
  }

  // HTML pages - network first
  if (pathname === '/' || pathname.endsWith('.html')) {
    return 'network-first';
  }

  // Default - network first
  return 'network-first';
}

/**
 * Cache-first strategy: return from cache, fallback to network
 */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    return new Response('Network error', { status: 503 });
  }
}

/**
 * Network-first strategy: try network, fallback to cache
 */
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    return cached || new Response('Network error', { status: 503 });
  }
}

/**
 * Stale-while-revalidate: return cached, fetch in background
 */
async function staleWhileRevalidate(request, cacheName) {
  const cached = await caches.match(request);

  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      const cache = caches.open(cacheName);
      cache.then(c => c.put(request, response.clone()));
    }
    return response;
  });

  return cached || fetchPromise;
}

/**
 * Fetch event - route requests through appropriate cache strategy
 */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = request.url;

  // Only handle http(s) GET requests
  if (!url.startsWith('http') || request.method !== 'GET') {
    return;
  }

  const strategy = getCacheStrategy(url);
  let cacheName = CACHE_NAMES.PAGES;

  // Select appropriate cache
  if (STATIC_DOMAINS.some(domain => new URL(url).hostname.includes(domain))) {
    cacheName = CACHE_NAMES.STATIC;
  } else if (TRAVELLINE_DOMAINS.some(domain => new URL(url).hostname.includes(domain))) {
    cacheName = CACHE_NAMES.TRAVELLINE;
  }

  if (strategy === 'cache-first') {
    event.respondWith(cacheFirst(request, cacheName));
  } else if (strategy === 'stale-while-revalidate') {
    event.respondWith(staleWhileRevalidate(request, cacheName));
  } else {
    event.respondWith(networkFirst(request, cacheName));
  }
});
