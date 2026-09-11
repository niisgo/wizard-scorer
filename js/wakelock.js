/* Bildschirm anlassen. Eine Runde Wizard dauert länger als die
   Display-Sperre des Telefons - und eine Punktetabelle, die man alle zwei
   Minuten wieder aufwecken muss, nervt am Tisch. */

import { KEYS, read, write } from "./storage.js";

let sentinel = null;
let wanted = read(KEYS.awake, false) === true;

export const isSupported = () => typeof navigator !== "undefined" && "wakeLock" in navigator;
export const isEnabled = () => wanted;

export async function setEnabled(value) {
  wanted = Boolean(value);
  write(KEYS.awake, wanted);
  if (wanted) await acquire();
  else await release();
  return wanted;
}

/** Beim Start die gespeicherte Einstellung wiederherstellen. */
export function initWakeLock() {
  if (!isSupported()) return;

  document.addEventListener("visibilitychange", () => {
    // Der Browser gibt die Sperre frei, sobald der Tab in den Hintergrund
    // geht - beim Zurückkommen also neu anfordern.
    if (wanted && document.visibilityState === "visible") acquire();
  });

  if (wanted) acquire();
}

async function acquire() {
  if (!isSupported() || sentinel) return;
  try {
    sentinel = await navigator.wakeLock.request("screen");
    sentinel.addEventListener("release", () => {
      sentinel = null;
    });
  } catch {
    // Akkusparmodus oder Nutzergeste fehlt - nicht weiter schlimm.
    sentinel = null;
  }
}

async function release() {
  try {
    await sentinel?.release();
  } catch {
    /* egal */
  }
  sentinel = null;
}
