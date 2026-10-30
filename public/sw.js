/* StudyFlow — service worker (app shell + hors ligne) */
const CACHE_NAME = 'studyflow-shell-v2'
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './favicon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  /* __PRECACHE_ASSETS__ */
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // Un fichier manquant ne doit pas bloquer tout le pré-cache.
      Promise.all(SHELL.map((url) => cache.add(url).catch(() => undefined))),
    ).then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

const saveCopy = (request, response) => {
  if (!response || !response.ok) return
  const copy = response.clone()
  caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
}

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Navigation : réseau d'abord, repli sur l'application en cache (hors ligne).
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          saveCopy(new Request(new URL('./index.html', self.location).href), response.clone())
          saveCopy(new Request(new URL('./', self.location).href), response.clone())
          return response
        })
        .catch(async () => {
          const cached = await caches.match(new URL('./index.html', self.location).href)
          return cached || (await caches.match(new URL('./', self.location).href)) || Response.error()
        }),
    )
    return
  }

  // Ressources : cache d'abord, mise à jour en arrière-plan.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          saveCopy(request, response)
          return response
        })
        .catch(() => cached)
      return cached || network
    }),
  )
})
