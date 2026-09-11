/* Alles rund um "App installieren" und Offline-Betrieb. */

const listeners = new Set();

/** Vom Browser zurückgehaltenes Installations-Event (nur Chromium). */
let installEvent = null;

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    // Ohne preventDefault zeigt Chrome seinen eigenen Balken.
    event.preventDefault();
    installEvent = event;
    notify();
  });

  window.addEventListener("appinstalled", () => {
    installEvent = null;
    notify();
  });
}

export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {
      // Ohne Service Worker läuft die App weiter, nur eben nicht offline.
    });
  });
}

/** Läuft die App bereits als installierte App? */
export function isStandalone() {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

export const canInstall = () => installEvent !== null && !isStandalone();

/** @param {() => void} listener wird aufgerufen, wenn sich canInstall() ändert */
export function onInstallChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** @returns {Promise<boolean>} true, wenn die Installation angenommen wurde */
export async function promptInstall() {
  if (!installEvent) return false;

  const event = installEvent;
  installEvent = null;
  notify();

  event.prompt();
  const { outcome } = await event.userChoice;
  return outcome === "accepted";
}

function notify() {
  for (const listener of listeners) listener();
}
