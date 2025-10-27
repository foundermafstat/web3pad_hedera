// Service Worker for W3P Gaming Platform
// Version: 1.0.0

const CACHE_VERSION = 'v1';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;
const VIDEO_CACHE = `videos-${CACHE_VERSION}`;

// Static assets to precache
const STATIC_ASSETS = [
  '/',
  '/games',
  '/leaderboard',
  '/players',
  '/w3h-icon.jpg',
  '/w3h-logo-black.png',
  '/w3h-logo-white.png',
];

// Install event - precache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Precaching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name.startsWith('static-') || 
                   name.startsWith('dynamic-') || 
                   name.startsWith('images-') || 
                   name.startsWith('videos-');
          })
          .filter((name) => {
            return name !== STATIC_CACHE && 
                   name !== DYNAMIC_CACHE && 
                   name !== IMAGE_CACHE && 
                   name !== VIDEO_CACHE;
          })
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - handle requests with different strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip WebSocket and real-time connections
  if (url.pathname.startsWith('/socket.io') || 
      url.pathname.startsWith('/_next/webpack-hmr')) {
    return;
  }

  // Strategy: Cache First for videos (large files)
  if (url.pathname.startsWith('/videos/') || url.pathname.endsWith('.mp4')) {
    event.respondWith(cacheFirstStrategy(request, VIDEO_CACHE));
    return;
  }

  // Strategy: Cache First for images
  if (url.pathname.startsWith('/images/') || 
      url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/)) {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE));
    return;
  }

  // Strategy: Network First for API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE));
    return;
  }

  // Strategy: Stale While Revalidate for pages and static assets
  if (url.pathname.startsWith('/_next/') || 
      url.pathname.endsWith('.js') || 
      url.pathname.endsWith('.css')) {
    event.respondWith(staleWhileRevalidateStrategy(request, STATIC_CACHE));
    return;
  }

  // Strategy: Network First for HTML pages
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE));
    return;
  }

  // Default: Network First
  event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE));
});

// Cache First Strategy (best for large static assets like videos/images)
async function cacheFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    console.log('[SW] Cache hit:', request.url);
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[SW] Fetch failed:', error);
    throw error;
  }
}

// Network First Strategy (best for dynamic content)
async function networkFirstStrategy(request, cacheName) {
  // Skip caching for unsupported schemes
  if (request.url.startsWith('chrome-extension:') || 
      request.url.startsWith('moz-extension:') || 
      request.url.startsWith('safari-extension:')) {
    return fetch(request);
  }

  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone()).catch(() => {
        // Ignore cache put errors for unsupported schemes
      });
    }
    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

// Stale While Revalidate Strategy (best for frequently updated assets)
async function staleWhileRevalidateStrategy(request, cacheName) {
  // Skip caching for unsupported schemes
  if (request.url.startsWith('chrome-extension:') || 
      request.url.startsWith('moz-extension:') || 
      request.url.startsWith('safari-extension:')) {
    return fetch(request);
  }

  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone()).catch(() => {
        // Ignore cache put errors for unsupported schemes
      });
    }
    return response;
  });

  return cached || fetchPromise;
}

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => caches.delete(name))
        );
      })
    );
  }
});

