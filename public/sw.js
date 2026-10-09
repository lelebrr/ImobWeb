/* imobWeb service worker — v2
 * - /_next/static e ícones: cache-first (arquivos com hash, imutáveis)
 * - navegação: rede primeiro; se falhar, usa a última cópia em cache; por fim /offline.html
 * - /api e requisições não-GET: nunca passam pelo cache
 */
const VERSION = "v2";
const STATIC_CACHE = `imobweb-static-${VERSION}`;
const PAGES_CACHE = `imobweb-pages-${VERSION}`;
const OFFLINE_URL = "/offline.html";
const PRECACHE_URLS = [OFFLINE_URL, "/manifest.json", "/icons/icon-192x192.png", "/icons/icon-512x512.png"];
const PAGE_CACHE_LIMIT = 30;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  const keep = [STATIC_CACHE, PAGES_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !keep.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > max) await Promise.all(keys.slice(0, keys.length - max).map((k) => cache.delete(k)));
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  // Arquivos estáticos com hash: cache-first
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(STATIC_CACHE).then((c) => c.put(req, copy));
            }
            return res;
          }),
      ),
    );
    return;
  }

  // Navegação: rede primeiro, cópia em cache, página offline.
  // Só a vistoria fica em cache (funciona em campo, sem sinal); o restante do CRM nunca é guardado.
  if (req.mode === "navigate") {
    const cacheable = url.pathname.startsWith("/admin/vistoria");
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (cacheable && res.ok && res.type === "basic" && !res.redirected) {
            const copy = res.clone();
            caches
              .open(PAGES_CACHE)
              .then((c) => c.put(req, copy))
              .then(() => trim(PAGES_CACHE, PAGE_CACHE_LIMIT));
          }
          return res;
        })
        .catch(async () => (await caches.match(req)) || (await caches.match(OFFLINE_URL)) || Response.error()),
    );
  }
});
