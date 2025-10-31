const CACHE = 'kira-cache-v1';
const ASSETS = [
  '/',
  '/static/style.css',
  '/static/script.js',
  '/static/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  e.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(request, copy));
      return res;
    }).catch(() => cached))
  );
});


