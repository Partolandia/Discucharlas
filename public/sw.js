// Service worker mínimo de Discucharlas.
//
// Deliberadamente NO cacheamos datos del club: son multiusuario, privados y
// cambian con cada sesión, así que servir una copia vieja sería peor que un
// error de red. Solo damos (a) instalabilidad y (b) una pantalla offline digna.

const VERSION = "discucharlas-v2";
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
  //
  // caches.match() puede resolver a undefined si la caché se vació, y
  // respondWith(undefined) deja la pestaña en blanco. Por eso siempre
  // devolvemos una Response de verdad.
  if (req.mode === "navigate") {
    evento.respondWith(
      fetch(req).catch(async () => {
        const guardada = await caches.match(OFFLINE);
        return (
          guardada ??
          new Response(
            "<!doctype html><meta charset=utf-8><title>Sin conexión</title>" +
              "<p style=\"font-family:system-ui;padding:2rem\">Discucharlas necesita conexión. " +
              "Vuelve a intentar en un momento.</p>",
            { status: 503, headers: { "content-type": "text/html; charset=utf-8" } }
          )
        );
      })
    );
  }
});
