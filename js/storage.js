/* Dünner Wrapper um localStorage. Der Speicher kann fehlen (privater Modus,
   blockierte Cookies) - dann läuft die App eben ohne Wiederaufnahme weiter,
   statt beim Start zu sterben. */

const PREFIX = "wizard-scorer";

export const KEYS = {
  game: `${PREFIX}:game:v1`,
  names: `${PREFIX}:names:v1`,
  theme: `${PREFIX}:theme:v1`,
  awake: `${PREFIX}:awake:v1`,
};

function backend() {
  try {
    const probe = `${PREFIX}:probe`;
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return null;
  }
}

const store = typeof window === "undefined" ? null : backend();

export const isAvailable = () => store !== null;

export function read(key, fallback = null) {
  if (!store) return fallback;
  try {
    const raw = store.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function write(key, value) {
  if (!store) return false;
  try {
    store.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    // Quota voll oder Schreiben verboten - kein Grund, das Spiel abzubrechen.
    return false;
  }
}

export function remove(key) {
  if (!store) return;
  try {
    store.removeItem(key);
  } catch {
    /* ignorieren */
  }
}
