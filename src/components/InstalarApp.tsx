"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

type PromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const CONSULTA_INSTALADA = "(display-mode: standalone)";

function suscribirInstalada(alCambiar: () => void) {
  const mq = window.matchMedia(CONSULTA_INSTALADA);
  mq.addEventListener("change", alCambiar);
  window.addEventListener("appinstalled", alCambiar);
  return () => {
    mq.removeEventListener("change", alCambiar);
    window.removeEventListener("appinstalled", alCambiar);
  };
}

function leerInstalada() {
  return (
    window.matchMedia(CONSULTA_INSTALADA).matches ||
    // Safari iOS marca así una app añadida a la pantalla de inicio.
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function esIOS() {
  const nav = window.navigator;
  return (
    /iphone|ipad|ipod/i.test(nav.userAgent) ||
    // iPadOS se presenta como Mac con pantalla táctil.
    (nav.platform === "MacIntel" && nav.maxTouchPoints > 1)
  );
}

/**
 * Botón de instalación de la PWA.
 *
 * No usamos tiendas de aplicaciones: en Android/Chrome capturamos
 * `beforeinstallprompt`; en iOS esa API no existe, así que explicamos el gesto
 * real (Compartir → Añadir a inicio) en vez de ofrecer un botón que no haría nada.
 */
export default function InstalarApp() {
  const [prompt, setPrompt] = useState<PromptEvent | null>(null);

  // En el servidor no sabemos nada del dispositivo: renderizamos un hueco del
  // mismo alto para no provocar salto al hidratar.
  const enCliente = useSyncExternalStore(
    useCallback(() => () => {}, []),
    () => true,
    () => false
  );

  const instalada = useSyncExternalStore(suscribirInstalada, leerInstalada, () => false);

  useEffect(() => {
    const alPoderInstalar = (evento: Event) => {
      evento.preventDefault();
      setPrompt(evento as PromptEvent);
    };
    window.addEventListener("beforeinstallprompt", alPoderInstalar);
    return () => window.removeEventListener("beforeinstallprompt", alPoderInstalar);
  }, []);

  async function instalar() {
    if (!prompt) return;
    await prompt.prompt();
    await prompt.userChoice;
    setPrompt(null);
  }

  if (!enCliente) {
    return <div className="h-14" aria-hidden />;
  }

  if (instalada) {
    return (
      <p className="rounded-[var(--radius-suave)] bg-[var(--color-propuestas)] px-5 py-4 text-[15px] text-white">
        Ya tienes Discucharlas en tu teléfono. Ábrela desde tu pantalla de inicio.
      </p>
    );
  }

  if (prompt) {
    return (
      <button
        onClick={instalar}
        className="w-full rounded-full bg-[var(--color-inicio)] px-8 py-4 text-[17px] font-medium text-white transition hover:brightness-95 active:scale-[0.99] sm:w-auto"
      >
        Instalar Discucharlas
      </button>
    );
  }

  const enIOS = esIOS();
  const pasos = enIOS
    ? ["Abre esta página en Safari", "Toca el botón Compartir", "Elige «Añadir a inicio»"]
    : ["Abre el menú de tu navegador", "Elige «Instalar app» o «Añadir a inicio»", "Confírmalo y listo"];

  return (
    <div className="rounded-[var(--radius-suave)] border border-[var(--color-linea)] bg-white/70 px-5 py-4">
      <p className="text-[13px] font-medium tracking-wide text-[var(--color-tinta-suave)] uppercase">
        {enIOS ? "Desde tu iPhone" : "Desde tu teléfono"}
      </p>
      <ol className="mt-2 space-y-1 text-[15px] text-[var(--color-tinta)]">
        {pasos.map((paso, i) => (
          <li key={paso} className="flex gap-2.5">
            <span className="text-[var(--color-inicio)] tabular-nums">{i + 1}.</span>
            <span>{paso}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
