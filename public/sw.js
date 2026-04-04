const CACHE_NAME = 'poof-v2'
const APP_SHELL = ['/', '/signin', '/signup', '/icons/icon-192.png', '/icons/icon-512.png']
const CACHEABLE_DESTINATIONS = new Set(['image', 'script', 'style', 'font', 'manifest', 'worker'])
const CACHEABLE_PATH_PREFIXES = ['/icons/', '/_next/static/']

function isRuntimeCacheEligible(request, url) {
  if (request.method !== 'GET') return false
  if (url.origin !== self.location.origin) return false
  if (url.pathname.startsWith('/api/')) return false
  if (request.mode === 'navigate') return true
  if (CACHEABLE_DESTINATIONS.has(request.destination)) return true
  return CACHEABLE_PATH_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))
}

async function cacheResponseIfSafe(request, response) {
  if (!response || !response.ok || response.type === 'opaque') return

  const cacheControl = (response.headers.get('cache-control') || '').toLowerCase()
  if (cacheControl.includes('no-store') || cacheControl.includes('private')) {
    return
  }

  const cache = await caches.open(CACHE_NAME)
  await cache.put(request, response.clone())
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()),
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

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (!isRuntimeCacheEligible(request, url)) {
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('/')))
    return
  }

  event.respondWith(
    caches.match(request).then(async (cached) => {
      if (cached) return cached

      const response = await fetch(request)
      await cacheResponseIfSafe(request, response)
      return response
    }),
  )
})
