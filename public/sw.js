// Bølgevarsel service worker
// Strategi:
//   - App-shell: Cache-first med network-update i bakgrunnen
//   - API-kall (/api/*): Network-first, ingen caching
//   - SOS (/api/sos): ALDRI cache, alltid live
//   - Statiske ikoner/manifest: Cache-first
//   - Offline-fallback: Havtema "Bølgevarsel er offline"

const CACHE_VERSION = "bolgevarsel-v1";
const APP_SHELL_CACHE = `${CACHE_VERSION}-shell`;
const STATIC_CACHE = `${CACHE_VERSION}-static`;

const APP_SHELL = [
  "/",
  "/manifest.webmanifest",
  "/favicon.svg",
  "/logo.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !key.startsWith(CACHE_VERSION))
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Bare GET-requests
  if (request.method !== "GET") return;

  // Bare same-origin
  if (url.origin !== self.location.origin) return;

  // SOS: ALDRI cache - må alltid være live
  if (url.pathname.startsWith("/api/sos")) {
    event.respondWith(fetch(request));
    return;
  }

  // API-kall: alltid network-first, ingen caching
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(
        () => new Response(JSON.stringify({ error: "Offline" }), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        })
      )
    );
    return;
  }

  // Auth-relaterte: alltid network (ingen cache)
  if (
    url.pathname.startsWith("/logg-inn") ||
    url.pathname.startsWith("/logg-ut") ||
    url.pathname.startsWith("/registrer")
  ) {
    event.respondWith(fetch(request));
    return;
  }

  // Admin: aldri cache
  if (url.pathname.startsWith("/admin")) {
    event.respondWith(fetch(request));
    return;
  }

  // Statiske assets (ikoner, manifest, _next/static): cache-first
  if (
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|woff2?|css|js)$/) ||
    url.pathname.startsWith("/_next/static/") ||
    url.pathname === "/manifest.webmanifest"
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // HTML-sider: network-first med cache-fallback
  if (request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(APP_SHELL_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then(
            (cached) =>
              cached ||
              new Response(
                `<!DOCTYPE html><html lang="nb"><head><meta charset="utf-8"><title>Offline · Bølgevarsel</title><meta name="viewport" content="width=device-width, initial-scale=1"><style>
                  * { box-sizing: border-box; margin: 0; padding: 0; }
                  body {
                    font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
                    background: linear-gradient(180deg, #0a2a3d 0%, #0e3d5c 100%);
                    color: #e8f4f8;
                    padding: 4rem 1.5rem;
                    text-align: center;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                  }
                  h1 {
                    font-family: 'Fraunces', Georgia, serif;
                    font-style: italic;
                    font-weight: 400;
                    font-size: 2.5rem;
                    margin-bottom: 1rem;
                    color: #4da8cc;
                  }
                  p {
                    color: #a8c5d6;
                    max-width: 30rem;
                    margin: 0 auto;
                    line-height: 1.6;
                    font-size: 1rem;
                  }
                  button {
                    margin-top: 2rem;
                    padding: 0.8rem 1.8rem;
                    background: #4da8cc;
                    color: #0a2a3d;
                    border: none;
                    border-radius: 999px;
                    font-size: 0.95rem;
                    font-weight: 500;
                    cursor: pointer;
                    font-family: inherit;
                  }
                  button:hover { background: #6bbcdc; }
                  .wave {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                    opacity: 0.5;
                  }
                </style></head>
                <body>
                  <div class="wave">🌊</div>
                  <h1>Bølgevarsel er offline</h1>
                  <p>Du ser ut til å være uten nett akkurat nå. Sjekk dekningen — siste lagrede data kommer tilbake så snart du er online igjen.</p>
                  <button onclick="location.reload()">Prøv igjen</button>
                </body></html>`,
                { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
              )
          )
        )
    );
    return;
  }
});
