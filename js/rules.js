/* Die Spielregeln von Wizard als reine Funktionen.
   Kein DOM, kein State - damit sich alles hier direkt testen laesst. */

/** Ein Wizard-Blatt hat 60 Karten (4x1-13, 4 Zauberer, 4 Narren). */
export const DECK_SIZE = 60;

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 6;

/** Treffer-Bonus, wenn die Ansage exakt stimmt. */
export const HIT_BONUS = 20;
/** Punkte pro Stich bei korrekter Ansage. */
export const POINTS_PER_TRICK = 10;
/** Abzug pro Stich Abweichung bei falscher Ansage. */
export const PENALTY_PER_TRICK = 10;

/**
 * Anzahl der Runden: Es wird so lange gespielt, bis das Blatt nicht mehr
 * reicht. Bei 3 Spielern sind das 20 Runden, bei 6 Spielern nur noch 10.
 *
 * @param {number} playerCount
 * @returns {number}
 */
export function totalRounds(playerCount) {
  return Math.floor(DECK_SIZE / playerCount);
}

/**
 * In Runde n bekommt jeder Spieler genau n Karten - und es gibt entsprechend
 * n Stiche zu holen.
 *
 * @param {number} round 1-basiert
 * @returns {number}
 */
export function cardsInRound(round) {
  return round;
}

/**
 * Der Geber wechselt reihum. In Runde 1 gibt Spieler 0.
 *
 * @param {number} round 1-basiert
 * @param {number} playerCount
 * @returns {number} Index im Spieler-Array
 */
export function dealerIndex(round, playerCount) {
  return (round - 1) % playerCount;
}

/**
 * Angesagt wird links vom Geber beginnend - der Geber ist also zuletzt dran
 * und traegt damit die "es darf nicht aufgehen"-Beschraenkung.
 *
 * @param {number} round 1-basiert
 * @param {number} playerCount
 * @returns {number[]} Spieler-Indizes in Ansage-Reihenfolge
 */
export function biddingOrder(round, playerCount) {
  const dealer = dealerIndex(round, playerCount);
  const order = [];
  for (let step = 1; step <= playerCount; step += 1) {
    order.push((dealer + step) % playerCount);
  }
  return order;
}

/**
 * Die Summe aller Ansagen darf nie der Anzahl der Stiche entsprechen - es muss
 * also immer mindestens ein Stich zu viel oder zu wenig angesagt sein.
 *
 * @param {number[]} bids alle Ansagen der Runde
 * @param {number} cards Karten (= Stiche) in dieser Runde
 * @returns {boolean}
 */
export function bidSumIsAllowed(bids, cards) {
  return sum(bids) !== cards;
}

/**
 * Welche Zahl ist fuer den letzten Ansagenden gesperrt? Genau die, mit der die
 * Runde aufgehen wuerde. Liegt sie ausserhalb von 0..cards, ist nichts
 * gesperrt (dann haben die anderen bereits zu viel angesagt).
 *
 * @param {number} cards Karten in dieser Runde
 * @param {number[]} previousBids Ansagen aller Spieler vor dem letzten
 * @returns {number|null} gesperrte Ansage oder null
 */
export function forbiddenBid(cards, previousBids) {
  const rest = cards - sum(previousBids);
  return rest >= 0 && rest <= cards ? rest : null;
}

/**
 * Punkte eines Spielers fuer eine Runde nach offiziellen Regeln:
 * Ansage getroffen  -> 20 Punkte + 10 pro geholtem Stich.
 * Ansage verfehlt   -> 10 Minuspunkte pro Stich Abweichung (nach oben wie
 *                      nach unten).
 *
 * @param {number} bid angesagte Stiche
 * @param {number} tricks tatsaechlich geholte Stiche
 * @returns {number}
 */
export function roundScore(bid, tricks) {
  if (bid === tricks) {
    return HIT_BONUS + POINTS_PER_TRICK * tricks;
  }
  return -PENALTY_PER_TRICK * Math.abs(bid - tricks);
}

/**
 * Punkte aller Spieler fuer eine Runde.
 *
 * @param {number[]} bids
 * @param {number[]} tricks
 * @returns {number[]}
 */
export function scoreRound(bids, tricks) {
  return bids.map((bid, index) => roundScore(bid, tricks[index]));
}

/**
 * Die Stiche einer Runde muessen exakt aufgehen - es gibt nicht mehr und nicht
 * weniger Stiche als Karten.
 *
 * @param {number[]} tricks
 * @param {number} cards
 * @returns {boolean}
 */
export function trickSumIsValid(tricks, cards) {
  return sum(tricks) === cards;
}

/**
 * Laufende Gesamtpunkte je Spieler ueber alle bereits gewerteten Runden.
 *
 * @param {number} playerCount
 * @param {{scores: number[]}[]} playedRounds
 * @returns {number[]}
 */
export function totalScores(playerCount, playedRounds) {
  const totals = new Array(playerCount).fill(0);
  for (const round of playedRounds) {
    if (!round?.scores) continue;
    round.scores.forEach((score, index) => {
      totals[index] += score;
    });
  }
  return totals;
}

/**
 * Platzierung nach Punkten. Gleichstand teilt sich den Platz, die naechste
 * Platzierung springt entsprechend weiter (1, 2, 2, 4).
 *
 * @param {number[]} totals
 * @returns {{index: number, total: number, rank: number}[]} absteigend sortiert
 */
export function standings(totals) {
  const rows = totals
    .map((total, index) => ({ index, total, rank: 1 }))
    .sort((a, b) => b.total - a.total);

  rows.forEach((row, position) => {
    const previous = rows[position - 1];
    row.rank = previous && previous.total === row.total ? previous.rank : position + 1;
  });

  return rows;
}

function sum(numbers) {
  return numbers.reduce((total, value) => total + value, 0);
}
