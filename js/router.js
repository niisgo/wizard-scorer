/* Winziger Screen-Router. Keine URLs - die App ist ein Ablauf, kein
   Dokument, und ein versehentlicher Reload soll in der Partie landen. */

import { paint } from "./ui/shell.js";

const screens = new Map();
let active = { name: null, params: {} };

/**
 * @param {string} name
 * @param {(params: object) => import("./ui/shell.js").ScreenView} factory
 */
export function register(name, factory) {
  screens.set(name, factory);
}

/** Zu einem Screen wechseln. */
export function go(name, params = {}) {
  active = { name, params };
  draw();
}

/** Aktuellen Screen neu zeichnen (z.B. nach einer Zustandsaenderung). */
export function refresh() {
  if (active.name) draw();
}

export const currentScreen = () => active.name;

function draw() {
  const factory = screens.get(active.name);
  if (!factory) {
    throw new Error(`Unbekannter Screen: ${active.name}`);
  }
  paint(factory(active.params));
}
