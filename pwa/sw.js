const CACHE_NAME = 'bibmundo-cache-v1';

// Calcula la base de la PWA según la ubicación del Service Worker.
// Esto permite que la misma app funcione bajo /pwa/ o raíz.
let BASE = self.location.pathname.replace(/\/sw\.js$/, '');
if (!BASE.endsWith('/')) BASE += '/';

const ASSETS = [
  BASE,
  BASE + 'index.html',
  BASE + 'styles.css',
  BASE + 'app.js',
  BASE + 'manifest.json',
  BASE + 'icons/icon.svg',
  BASE + 'library.json'
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
  // Offline-first: intenta servir desde cache, luego red y luego caché de recursos por separado
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request)
        .then(response => {
          // caché de recursos estáticos adicionales si se obtienen con éxito
          if (event.request.method === 'GET' && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          // Si no se puede conectar y no está en cache, intentar respuesta offline genérica
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
    })
  );
});
