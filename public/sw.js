// Edu Loan service worker — hand-written (no Workbox/next-pwa) so caching
// rules are explicit and auditable rather than pattern-matched by a library.
//
// SECURITY MODEL (read this before touching the fetch handler):
// This is an education-loan platform — API responses can carry auth tokens,
// KYC/citizenship data, financial details, and loan/application records.
// The rule is allowlist, not denylist: a request is only ever served from or
// saved to a cache if it positively matches one of the "safe" categories
// below (same-origin static build output, same-origin local image/font
// assets, or the precached offline shell). Everything else — every API call
// (which also lives on a different origin/port, see NEXT_PUBLIC_BASE_URL),
// every non-GET request, every /_next/image request (can proxy private
// document URLs), and every navigation response — is passed straight to the
// network with no read from and no write to any cache.
//
// Bump CACHE_VERSION on any deploy that changes what/how assets are cached
// so the activate handler drops the previous version's entries.
const CACHE_VERSION = "v1";
const STATIC_CACHE = `edu-loan-static-${CACHE_VERSION}`;
const IMAGE_CACHE = `edu-loan-images-${CACHE_VERSION}`;
const CURRENT_CACHES = [STATIC_CACHE, IMAGE_CACHE];

const OFFLINE_URL = "/offline";
const PRECACHE_URLS = [
  OFFLINE_URL,
  "/favicon.ico",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

const STATIC_IMAGE_EXTENSIONS = /\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico)$/i;

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      // Individual puts (not cache.addAll) so one missing/failed asset can't
      // fail the whole install and leave the app with no service worker at all.
      await Promise.allSettled(
        PRECACHE_URLS.map(async (url) => {
          try {
            const response = await fetch(url, { cache: "no-cache" });
            if (response.ok) await cache.put(url, response);
          } catch {
            // Offline during install, or asset missing — non-fatal.
          }
        }),
      );
    })(),
  );
  // Do NOT self.skipWaiting() here — an already-open tab on the old version
  // should keep working until the user agrees to update (see UPDATE flow).
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => !CURRENT_CACHES.includes(name))
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

// Update flow: the page asks the *waiting* worker to activate immediately
// once the user has agreed (see components/pwa/ServiceWorkerRegistration.tsx).
// Logout flow: the page asks us to drop the image cache so nothing from a
// previous session's session lingers for the next person on a shared device.
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data?.type === "CLEAR_RUNTIME_CACHES") {
    event.waitUntil(caches.delete(IMAGE_CACHE));
  }
});

function isNextStaticAsset(url) {
  return url.origin === self.location.origin && url.pathname.startsWith("/_next/static/");
}

function isLocalStaticImage(url) {
  if (url.origin !== self.location.origin) return false;
  // /_next/image can proxy private, per-user document URLs via its `url=`
  // query param — never treat it as a plain static image.
  if (url.pathname.startsWith("/_next/image")) return false;
  return STATIC_IMAGE_EXTENSIONS.test(url.pathname);
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => undefined);
  return cached || network || fetch(request);
}

async function networkFirstNavigation(request) {
  try {
    return await fetch(request);
  } catch {
    const cache = await caches.open(STATIC_CACHE);
    const offline = await cache.match(OFFLINE_URL);
    return offline || Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Never intercept anything but plain reads. POST/PUT/PATCH/DELETE (loan
  // submissions, document uploads, approvals, …) always go straight to the
  // network, untouched.
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Belt-and-suspenders: even if the API were ever proxied same-origin
  // under /api/, never let it touch a cache.
  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (isNextStaticAsset(url) || request.destination === "font") {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  if (isLocalStaticImage(url) || request.destination === "image") {
    // destination === "image" alone isn't enough to prove same-origin/safe,
    // so re-check origin here too.
    if (url.origin === self.location.origin && !url.pathname.startsWith("/_next/image")) {
      event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
    }
    return;
  }

  // Cross-origin (API host, Supabase storage, etc.) and anything else
  // unrecognized — let the browser handle it natively, no cache involved.
});
