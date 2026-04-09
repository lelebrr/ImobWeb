/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'imobweb-v1';
const OFFLINE_URL = '/offline.html';
const API_CACHE_NAME = 'imobweb-api-v1';

const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

const API_CACHE_DURATION = 5 * 60 * 1000;

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(PRECACHE_URLS);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      await self.clients.claim();
      const cacheKeys = await caches.keys();
      await Promise.all(
        cacheKeys
          .filter((key) => key !== CACHE_NAME && key !== API_CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })()
  );
});

self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  if (url.pathname.startsWith('/api/') && !url.pathname.includes('/auth/')) {
    event.respondWithhandleApiRequest(request));
    return;
  }

  if (url.origin === self.location.origin) {
    if (url.pathname.startsWith('/_next/') || url.pathname.includes('/api/')) {
      return;
    }

    event.respondWith(handleStaticRequest(request));
  }
});

async function handleStaticRequest(request: Request): Promise<Response> {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    const responseClone = networkResponse.clone();
    cache.put(request, responseClone);
    return networkResponse;
  } catch {
    if (request.headers.get('accept')?.includes('text/html')) {
      const offlinePage = await cache.match(OFFLINE_URL);
      if (offlinePage) return offlinePage;
    }
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

async function handleApiRequest(request: Request): Promise<Response> {
  const cache = await caches.open(API_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    const cachedTime = cachedResponse.headers.get('x-cached-time');
    if (cachedTime && Date.now() - parseInt(cachedTime) < API_CACHE_DURATION) {
      return cachedResponse;
    }
  }

  try {
    const networkResponse = await fetch(request);
    const responseClone = networkResponse.clone();
    const headers = new Headers(responseClone.headers);
    headers.set('x-cached-time', Date.now().toString());
    const cachedResponse = new Response(await responseClone.text(), {
      status: responseClone.status,
      statusText: responseClone.statusText,
      headers,
    });
    cache.put(request, cachedResponse);
    return networkResponse;
  } catch {
    if (cachedResponse) return cachedResponse;
    return new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return;

  const data = event.data.json();
  const options: NotificationOptions = {
    body: data.body || 'Nova notificação',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' },
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'imobWeb', options)
  );
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(self.clients.openWindow(url));
});

self.addEventListener('message', (event: MessageEvent) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

export {};