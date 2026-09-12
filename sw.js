/* Service Worker: macht die App offline nutzbar.

   Strategie ist "stale-while-revalidate" - ausgeliefert wird sofort aus dem
   Cache, parallel wird im Hintergrund die frische Datei geholt. Am Kartentisch
   startet die App dadurch auch ohne Empfang sofort, und beim nächsten Start
   ist die neueste Version da.

   Das Projekt hat bewusst keinen Build-Schritt, deshalb steht die Liste der
   Dateien hier von Hand. Neue Datei angelegt? Hier eintragen. */

const CACHE = "wizard-scorer-v1";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",

  "./css/fonts.css",
  "./css/tokens.css",
  "./css/base.css",
  "./css/components.css",
  "./css/screens.css",

  "./js/main.js",
  "./js/dom.js",
  "./js/rules.js",
  "./js/game.js",
  "./js/store.js",
  "./js/storage.js",
  "./js/router.js",
  "./js/flow.js",
  "./js/pwa.js",
  "./js/theme.js",
  "./js/wakelock.js",
  "./js/ui/shell.js",
  "./js/ui/widgets.js",
  "./js/ui/results.js",
  "./js/ui/menu.js",
  "./js/screens/start.js",
  "./js/screens/names.js",
  "./js/screens/deal.js",
  "./js/screens/board.js",
  "./js/screens/bids.js",
  "./js/screens/tricks.js",
  "./js/screens/final.js",

  "./fonts/cinzel-latin.woff2",
  "./fonts/cinzel-latin-ext.woff2",
  "./fonts/inter-latin.woff2",
  "./fonts/inter-latin-ext.woff2",

  "./icons/favicon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      // allSettled: eine einzelne fehlende Datei darf die Installation
      // nicht scheitern lassen.
      await Promise.allSettled(
        ASSETS.map((asset) => cache.add(new Request(asset, { cache: "reload" }))),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  if (new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(respond(event));
});

async function respond(event) {
  const { request } = event;
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request, { ignoreSearch: true });

  const fromNetwork = fetch(request)
    .then((response) => {
      if (response.ok && response.type === "basic") {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    // Aktualisierung im Hintergrund weiterlaufen lassen.
    event.waitUntil(fromNetwork);
    return cached;
  }

  const fresh = await fromNetwork;
  if (fresh) return fresh;

  // Offline und nichts im Cache: wenigstens die App-Hülle ausliefern.
  if (request.mode === "navigate") {
    const shell = await cache.match("./index.html");
    if (shell) return shell;
  }

  return new Response("Offline", {
    status: 503,
    statusText: "Offline",
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
