/* Verbindet den Spielzustand mit den Screens: Welche Phase zeigt was?
   So landet ein Reload immer genau dort, wo die Runde stehen geblieben ist. */

import { PHASE } from "./game.js";
import { go } from "./router.js";
import { getGame } from "./store.js";

const SCREEN_BY_PHASE = {
  [PHASE.DEAL]: "deal",
  [PHASE.BOARD]: "board",
  [PHASE.BIDS]: "bids",
  [PHASE.TRICKS]: "tricks",
  [PHASE.DONE]: "final",
};

/** @param {object} game */
export function screenFor(game) {
  return SCREEN_BY_PHASE[game.phase] ?? "deal";
}

/** Zum Screen der laufenden Partie springen - oder zum Start, falls keine da ist. */
export function resume() {
  const game = getGame();
  go(game ? screenFor(game) : "start");
}
