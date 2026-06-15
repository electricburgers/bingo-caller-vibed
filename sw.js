/* OPTIONAL — only needed for guaranteed cold-start offline on a real host
   (e.g. GitHub Pages). index.html works fully offline on its own once loaded;
   this service worker just caches the page so it opens with no wifi at all.
   Drop this file next to index.html in the same folder and it auto-registers. */
const CACHE = 'bingo-caller-v1';
const ASSETS = ['./', './index.html', './sw.js'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
