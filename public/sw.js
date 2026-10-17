const CACHE_NAME = 'safepark-pwa-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/apple-touch-icon.svg',
];

// Pre-cache static shell on install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Service Worker: Pre-caching partial failure:', err);
      });
    })
  );
  self.skipWaiting();
});

// Clean old caches on activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Cache with Network Fallback & Runtime Cache for JS/CSS/Images
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Stale-While-Revalidate for application assets and navigations
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              // Cache static assets and HTML navigations
              if (
                event.request.mode === 'navigate' ||
                url.pathname.endsWith('.js') ||
                url.pathname.endsWith('.css') ||
                url.pathname.endsWith('.svg') ||
                url.pathname.endsWith('.png') ||
                url.pathname.endsWith('.json')
              ) {
                cache.put(event.request, responseToCache);
              }
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback to cache when network fails or subterranean offline
          return cachedResponse || (event.request.mode === 'navigate' ? caches.match('/index.html') : undefined);
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// Push notification listener for scheduled meter alerts
self.addEventListener('push', (event) => {
  let payload = {
    title: '⚠️ 15 Minutes Left on Meter',
    body: 'Your vehicle will exceed the meter limit shortly. Return to your car to avoid a parking ticket.',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: 'safepark-meter-alert',
  };

  if (event.data) {
    try {
      const data = event.data.json();
      payload = { ...payload, ...data };
    } catch {
      payload.body = event.data.text();
    }
  }

  const options = {
    body: payload.body,
    icon: payload.icon,
    badge: payload.badge,
    vibrate: [200, 100, 200, 100, 200],
    tag: payload.tag || 'safepark-meter-alert',
    renotify: true,
    requireInteraction: true,
    data: { url: '/' },
    actions: [
      { action: 'view_car', title: '🚗 View Car' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

// Handle notification click to focus or open SafePark
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
