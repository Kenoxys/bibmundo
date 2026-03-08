const CACHE_NAME = 'bibmundo-cache-v2';

// La app usa rutas relativas
const BASE = './';

const ASSETS = [
  BASE,
  BASE + 'index.html',
  BASE + 'styles.css',
  BASE + 'app.js',
  BASE + 'manifest.json',
  BASE + 'library.json',
  BASE + 'icons/icon.svg',
  BASE + 'icons/favicon-96x96.png',
  BASE + 'icons/web-app-manifest-192x192.png',
  BASE + 'icons/web-app-manifest-512x512.png',
  BASE + 'icons/apple-touch-icon.png',
  BASE + 'icons/favicon.ico',
  BASE + 'lib/pdf.min.js',
  BASE + 'lib/pdf.worker.min.js'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
    ))
  );
});

self.addEventListener('fetch', event => {
  // Offline-first: intenta servir desde cache, luego red
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request)
        .then(response => {
          // Caché de recursos estáticos adicionales si son exitosos
          if (event.request.method === 'GET' && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          // Si no hay conexión y no está en cache, responder con página offline
          if (event.request.destination === 'document') {
            return caches.match(BASE + 'index.html');
          }
        });
    })
  );
});
