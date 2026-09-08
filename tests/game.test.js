import { test } from "node:test";
import assert from "node:assert/strict";

import {
  PHASE,
  cards,
  confirmDeal,
  createGame,
  isRoundScored,
  nextRound,
  restoreGame,
  roundsTotal,
  startBidding,
  startTricks,
  submitBids,
  submitTricks,
  totals,
  undoLastScoredRound,
} from "../js/game.js";

const NAMES = ["Nico", "Lea", "Jon"];

/** Spielt eine komplette Runde durch und gibt die neue Partie zurück. */
function playRound(game, bids, tricks) {
  let next = confirmDeal(game);
  next = startBidding(next);
  next = submitBids(next, bids);
  next = startTricks(next);
  return submitTricks(next, tricks);
}

test("eine neue Partie startet in Runde 1 mit der Austeil-Ansage", () => {
  const game = createGame(NAMES);
  assert.equal(game.round, 1);
  assert.equal(game.phase, PHASE.DEAL);
  assert.equal(cards(game), 1);
  assert.equal(roundsTotal(game), 20);
  assert.deepEqual(totals(game), [0, 0, 0]);
});

test("zu wenige oder zu viele Spieler werden abgelehnt", () => {
  assert.throws(() => createGame(["Nico", "Lea"]));
  assert.throws(() => createGame(["a", "b", "c", "d", "e", "f", "g"]));
});

test("eine gespielte Runde wird gewertet und aufaddiert", () => {
  const game = playRound(createGame(NAMES), [1, 0, 1], [1, 0, 0]);
  assert.equal(isRoundScored(game), true);
  assert.deepEqual(game.rounds[0].scores, [30, 20, -10]);
  assert.deepEqual(totals(game), [30, 20, -10]);
  assert.equal(game.phase, PHASE.BOARD);
});

test("aufgehende Ansagen werden abgewiesen", () => {
  const game = startBidding(confirmDeal(createGame(NAMES)));
  assert.throws(() => submitBids(game, [1, 0, 0]), /nicht aufgehen/);
  assert.doesNotThrow(() => submitBids(game, [1, 1, 0]));
});

test("die Stiche müssen exakt der Kartenzahl entsprechen", () => {
  let game = submitBids(startBidding(confirmDeal(createGame(NAMES))), [1, 1, 0]);
  game = startTricks(game);
  assert.throws(() => submitTricks(game, [1, 1, 0]), /genau 1 Stiche/);
  assert.doesNotThrow(() => submitTricks(game, [0, 1, 0]));
});

test("Ansagen außerhalb von 0 bis Kartenzahl werden abgewiesen", () => {
  const game = startBidding(confirmDeal(createGame(NAMES)));
  assert.throws(() => submitBids(game, [2, 0, 0]));
  assert.throws(() => submitBids(game, [-1, 1, 1]));
});

test("nach der Wertung geht es in die nächste Runde mit einer Karte mehr", () => {
  const game = nextRound(playRound(createGame(NAMES), [1, 0, 1], [1, 0, 0]));
  assert.equal(game.round, 2);
  assert.equal(game.phase, PHASE.DEAL);
  assert.equal(cards(game), 2);
});

test("eine ungewertete Runde lässt sich nicht abschließen", () => {
  assert.throws(() => nextRound(createGame(NAMES)), /noch nicht gewertet/);
});

test("nach der letzten Runde ist die Partie vorbei", () => {
  let game = createGame(["Nico", "Lea", "Jon", "Mia", "Tim", "Ben"]); // 10 Runden
  for (let round = 1; round <= 10; round += 1) {
    // Alle sagen 0 an (Summe 0, geht nie auf), einer holt am Ende alles.
    game = nextRound(playRound(game, [0, 0, 0, 0, 0, 0], [round, 0, 0, 0, 0, 0]));
  }
  assert.equal(game.phase, PHASE.DONE);
});

test("die letzte Wertung lässt sich zurücknehmen, die Ansagen bleiben", () => {
  const played = nextRound(playRound(createGame(NAMES), [1, 1, 0], [1, 0, 0]));
  const undone = undoLastScoredRound(played);

  assert.equal(undone.round, 1);
  assert.equal(undone.phase, PHASE.BOARD);
  assert.deepEqual(undone.rounds[0].bids, [1, 1, 0]);
  assert.equal(undone.rounds[0].scores, null);
  assert.deepEqual(totals(undone), [0, 0, 0]);
});

test("ohne gewertete Runde gibt es nichts zurückzunehmen", () => {
  assert.equal(undoLastScoredRound(createGame(NAMES)), null);
});

test("kaputte oder fremde Spielstände werden verworfen", () => {
  assert.equal(restoreGame(null), null);
  assert.equal(restoreGame({ version: 99 }), null);
  assert.equal(restoreGame({ ...createGame(NAMES), round: 21 }), null);
  assert.equal(restoreGame({ ...createGame(NAMES), phase: "haha" }), null);

  const valid = createGame(NAMES);
  assert.deepEqual(restoreGame(structuredClone(valid)), valid);
});
