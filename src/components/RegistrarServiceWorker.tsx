"use client";

import { useEffect } from "react";

/** Registra el service worker que hace instalable la app. */
export default function RegistrarServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Si el registro falla la web sigue funcionando; solo se pierde la instalación.
    });
  }, []);
  return null;
}
