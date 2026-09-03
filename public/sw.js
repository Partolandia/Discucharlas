// Service worker mínimo de Discucharlas.
//
// Deliberadamente NO cacheamos datos del club: son multiusuario, privados y
// cambian con cada sesión, así que servir una copia vieja sería peor que un
// error de red. Solo damos (a) instalabilidad y (b) una pantalla offline digna.

const VERSION = "discucharlas-v1";
const OFFLINE = "/offline.html";

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll([OFFLINE, "/icono-192.png"]))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((claves) =>
        Promise.all(claves.filter((k) => k !== VERSION).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (evento) => {
  const req = evento.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;

  // Solo las navegaciones tienen respaldo offline; todo lo demás va a la red.
  if (req.mode === "navigate") {
    evento.respondWith(fetch(req).catch(() => caches.match(OFFLINE)));
  }
});
