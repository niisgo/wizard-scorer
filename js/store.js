/* Der laufende Zustand der App: genau eine Partie, automatisch gesichert.
   Die Screens lesen ueber getGame() und melden sich per subscribe() an. */

import { restoreGame } from "./game.js";
import { KEYS, read, remove, write } from "./storage.js";

let game = restoreGame(read(KEYS.game));

const listeners = new Set();

/** @returns {object|null} laufende Partie oder null */
export function getGame() {
  return game;
}

export const hasGame = () => game !== null;

/**
 * Partie ersetzen (oder mit null beenden). Wird sofort gesichert und an alle
 * Abonnenten gemeldet.
 */
export function setGame(next) {
  game = next;
  if (next) {
    write(KEYS.game, next);
  } else {
    remove(KEYS.game);
  }
  for (const listener of listeners) listener(game);
  return game;
}

/**
 * Einen Uebergang aus game.js anwenden: update(nextRound) statt
 * setGame(nextRound(getGame())).
 *
 * @param {(game: object) => object|null} transition
 */
export function update(transition) {
  if (!game) return null;
  return setGame(transition(game));
}

/**
 * @param {(game: object|null) => void} listener
 * @returns {() => void} Abmelde-Funktion
 */
export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/* --- zuletzt benutzte Namen --------------------------------------------- */

export function rememberNames(names) {
  write(KEYS.names, names);
}

/**
 * Die Namen der letzten Partie - vorbelegt bleibt die gleiche Runde damit
 * beim naechsten Mal getippt statt neu eingegeben.
 *
 * @param {number} count
 * @returns {string[]}
 */
export function recallNames(count) {
  const saved = read(KEYS.names, []);
  const names = Array.isArray(saved) ? saved : [];
  return Array.from({ length: count }, (_, index) =>
    typeof names[index] === "string" ? names[index] : "",
  );
}
