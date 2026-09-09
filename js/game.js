/* Das Spielmodell: ein Partie-Objekt und die erlaubten Zustandsübergänge.
   Alle Funktionen sind seiteneffektfrei und geben eine neue Partie zurück. */

import {
  MAX_PLAYERS,
  MIN_PLAYERS,
  bidSumIsAllowed,
  biddingOrder,
  cardsInRound,
  dealerIndex,
  scoreRound,
  totalRounds,
  totalScores,
  trickSumIsValid,
} from "./rules.js";

export const GAME_VERSION = 1;

/** Die Stationen einer Runde. */
export const PHASE = {
  /** "Es werden 3 Karten ausgeteilt" - warten auf Bestätigung. */
  DEAL: "deal",
  /** Punkteübersicht mit dem jeweils passenden Hauptbutton. */
  BOARD: "board",
  /** Ansagen werden reihum eingetragen. */
  BIDS: "bids",
  /** Tatsächlich geholte Stiche werden eingetragen. */
  TRICKS: "tricks",
  /** Partie vorbei. */
  DONE: "done",
};

/**
 * Neue Partie anlegen.
 *
 * @param {string[]} names
 * @returns {object} Partie
 */
export function createGame(names) {
  if (names.length < MIN_PLAYERS || names.length > MAX_PLAYERS) {
    throw new Error(`Wizard wird mit ${MIN_PLAYERS} bis ${MAX_PLAYERS} Spielern gespielt.`);
  }

  return {
    version: GAME_VERSION,
    createdAt: new Date().toISOString(),
    players: names.map((name) => String(name)),
    round: 1,
    phase: PHASE.DEAL,
    rounds: [],
  };
}

/* --- Abgeleitete Werte --------------------------------------------------- */

export const playerCount = (game) => game.players.length;
export const roundsTotal = (game) => totalRounds(playerCount(game));
export const cards = (game) => cardsInRound(game.round);
export const dealer = (game) => dealerIndex(game.round, playerCount(game));
export const bidOrder = (game) => biddingOrder(game.round, playerCount(game));
export const totals = (game) => totalScores(playerCount(game), game.rounds);
export const isLastRound = (game) => game.round >= roundsTotal(game);

/**
 * Eintrag einer Runde (1-basiert), oder null wenn noch nichts erfasst wurde.
 */
export function roundEntry(game, round = game.round) {
  return game.rounds[round - 1] ?? null;
}

export const currentBids = (game) => roundEntry(game)?.bids ?? null;
export const currentTricks = (game) => roundEntry(game)?.tricks ?? null;
export const isRoundScored = (game) => Boolean(roundEntry(game)?.scores);

/* --- Übergänge --------------------------------------------------------- */

/** Zurück zur Punkteübersicht - etwa wenn eine Eingabe abgebrochen wird. */
export function toBoard(game) {
  return { ...game, phase: PHASE.BOARD };
}

/** Austeil-Ansage bestätigt -> zur Punkteübersicht. */
export const confirmDeal = toBoard;

/** "Schätzen" gedrückt (oder Ansagen korrigieren). */
export function startBidding(game) {
  return { ...game, phase: PHASE.BIDS };
}

/**
 * Ansagen der Runde speichern.
 *
 * @param {object} game
 * @param {number[]} bids Ansagen in Spieler-Reihenfolge
 */
export function submitBids(game, bids) {
  assertLength(game, bids, "Ansagen");
  if (!bidSumIsAllowed(bids, cards(game))) {
    throw new Error("Die Ansagen dürfen nicht aufgehen.");
  }

  return writeRound({ ...game, phase: PHASE.BOARD }, { bids: [...bids] });
}

/** "Runde beenden" gedrückt -> Stiche eintragen. */
export function startTricks(game) {
  return { ...game, phase: PHASE.TRICKS };
}

/**
 * Geholte Stiche speichern und die Runde werten.
 *
 * @param {object} game
 * @param {number[]} tricks
 */
export function submitTricks(game, tricks) {
  assertLength(game, tricks, "Stiche");
  if (!trickSumIsValid(tricks, cards(game))) {
    throw new Error(`Es müssen genau ${cards(game)} Stiche verteilt werden.`);
  }

  const bids = currentBids(game);
  if (!bids) throw new Error("Ohne Ansagen lässt sich die Runde nicht werten.");

  return writeRound({ ...game, phase: PHASE.BOARD }, {
    tricks: [...tricks],
    scores: scoreRound(bids, tricks),
  });
}

/** Nächste Runde - oder Schlusstabelle, wenn das Blatt aufgebraucht ist. */
export function nextRound(game) {
  if (!isRoundScored(game)) {
    throw new Error("Die laufende Runde ist noch nicht gewertet.");
  }
  if (isLastRound(game)) {
    return { ...game, phase: PHASE.DONE };
  }
  return { ...game, round: game.round + 1, phase: PHASE.DEAL };
}

/**
 * Letzte gewertete Runde zurücknehmen: Stiche und Punkte fallen weg, die
 * Ansagen bleiben stehen. Praktisch, wenn sich jemand verzählt hat.
 *
 * @returns {object|null} neue Partie, oder null wenn es nichts zurückzunehmen gibt
 */
export function undoLastScoredRound(game) {
  const lastScored = game.rounds.reduce(
    (found, entry, index) => (entry?.scores ? index + 1 : found),
    0,
  );
  if (lastScored === 0) return null;

  const rounds = game.rounds.map((entry, index) =>
    index + 1 === lastScored ? { ...entry, tricks: null, scores: null } : entry,
  );

  return { ...game, round: lastScored, phase: PHASE.BOARD, rounds };
}

/* --- Laden / Prüfen ----------------------------------------------------- */

/**
 * Eine gespeicherte Partie auf Plausibilität prüfen. Lieber eine Partie
 * verwerfen als mit kaputten Daten weiterrechnen.
 *
 * @param {unknown} raw
 * @returns {object|null}
 */
export function restoreGame(raw) {
  if (!raw || typeof raw !== "object") return null;

  const { version, players, round, phase, rounds } = /** @type {any} */ (raw);
  if (version !== GAME_VERSION) return null;
  if (!Array.isArray(players) || players.length < MIN_PLAYERS || players.length > MAX_PLAYERS) {
    return null;
  }
  if (!Array.isArray(rounds)) return null;
  if (!Object.values(PHASE).includes(phase)) return null;
  if (!Number.isInteger(round) || round < 1 || round > totalRounds(players.length)) {
    return null;
  }

  return raw;
}

/* --- intern -------------------------------------------------------------- */

function writeRound(game, patch) {
  const rounds = [...game.rounds];
  const index = game.round - 1;
  while (rounds.length <= index) rounds.push(null);
  rounds[index] = { bids: null, tricks: null, scores: null, ...rounds[index], ...patch };
  return { ...game, rounds };
}

function assertLength(game, values, label) {
  if (!Array.isArray(values) || values.length !== playerCount(game)) {
    throw new Error(`Es werden ${playerCount(game)} ${label} erwartet.`);
  }
  if (values.some((value) => !Number.isInteger(value) || value < 0 || value > cards(game))) {
    throw new Error(`${label} müssen zwischen 0 und ${cards(game)} liegen.`);
  }
}
