// Service Worker BBLC Learning Simulator, strategi network-first.
// Aplikasi selalu mengambil versi terbaru dari jaringan; cache hanya cadangan offline.
const CACHE = "bblc-sim-v1";
self.addEventListener("install", e => { self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then(res => {
      const salinan = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, salinan)).catch(() => {});
      return res;
    }).catch(() => caches.match(e.request))
  );
});
