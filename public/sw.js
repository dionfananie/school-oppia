/* Pica Games — Service Worker
   Strategy: offline-first untuk aset statis, network-first untuk navigasi.
   Versioned cache agar update bersih. */
const CACHE = "pica-v2";
const CORE_ASSETS = ["/", "/manifest.webmanifest", "/pica-icon.svg", "/pica-star.svg", "/favicon.ico"];

// Install: buka cache & precache core shell.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

// Activate: bersihkan cache versi lama.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Fetch
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Hanya tangani same-origin; serahkan cross-origin (fonts, dll) ke browser/cache default.
  if (url.origin !== self.location.origin) return;

  // Navigasi (dokumen): network-first, fallback ke cache root jika offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put("/", copy));
          return res;
        })
        .catch(() => caches.match("/").then((r) => r || caches.match(request)))
    );
    return;
  }

  // Aset statis (JS/CSS/gambar/svg): offline-first — cache-first, fallback network.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy));
          }
          return res;
        })
        .catch(() => caches.match("/"));
    })
  );
});
