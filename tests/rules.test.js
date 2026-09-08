import { test } from "node:test";
import assert from "node:assert/strict";

import {
  bidSumIsAllowed,
  biddingOrder,
  cardsInRound,
  dealerIndex,
  forbiddenBid,
  roundScore,
  scoreRound,
  standings,
  totalRounds,
  totalScores,
  trickSumIsValid,
} from "../js/rules.js";

test("Rundenanzahl richtet sich nach der Spielerzahl", () => {
  assert.equal(totalRounds(3), 20);
  assert.equal(totalRounds(4), 15);
  assert.equal(totalRounds(5), 12);
  assert.equal(totalRounds(6), 10);
});

test("in Runde n bekommt jeder n Karten", () => {
  assert.equal(cardsInRound(1), 1);
  assert.equal(cardsInRound(7), 7);
});

test("der Geber wechselt reihum", () => {
  assert.equal(dealerIndex(1, 4), 0);
  assert.equal(dealerIndex(4, 4), 3);
  assert.equal(dealerIndex(5, 4), 0);
});

test("angesagt wird links vom Geber, der Geber ist zuletzt dran", () => {
  assert.deepEqual(biddingOrder(1, 4), [1, 2, 3, 0]);
  assert.deepEqual(biddingOrder(3, 4), [3, 0, 1, 2]);
  assert.equal(biddingOrder(2, 5).at(-1), dealerIndex(2, 5));
});

test("die Summe der Ansagen darf nicht aufgehen", () => {
  assert.equal(bidSumIsAllowed([1, 1, 1], 3), false);
  assert.equal(bidSumIsAllowed([1, 1, 0], 3), true);
  assert.equal(bidSumIsAllowed([2, 1, 1], 3), true);
});

test("der letzte Ansagende hat genau eine gesperrte Zahl", () => {
  // 3 Karten, bisher 1 + 1 angesagt -> 1 wäre die Zahl, die aufgeht.
  assert.equal(forbiddenBid(3, [1, 1]), 1);
  // Niemand hat etwas angesagt -> die volle Stichzahl ist gesperrt.
  assert.equal(forbiddenBid(3, [0, 0]), 3);
});

test("ist bereits zu viel angesagt, ist nichts gesperrt", () => {
  assert.equal(forbiddenBid(3, [2, 2]), null);
  assert.equal(forbiddenBid(1, [1, 1]), null);
});

test("getroffene Ansage gibt 20 Punkte plus 10 je Stich", () => {
  assert.equal(roundScore(0, 0), 20);
  assert.equal(roundScore(1, 1), 30);
  assert.equal(roundScore(3, 3), 50);
});

test("verfehlte Ansage kostet 10 Punkte je Stich Abweichung", () => {
  assert.equal(roundScore(0, 2), -20);
  assert.equal(roundScore(3, 1), -20);
  assert.equal(roundScore(2, 3), -10);
});

test("scoreRound wertet die ganze Runde auf einmal", () => {
  assert.deepEqual(scoreRound([1, 0, 2], [1, 1, 1]), [30, -10, -10]);
});

test("die Stiche einer Runde müssen exakt aufgehen", () => {
  assert.equal(trickSumIsValid([1, 1, 1], 3), true);
  assert.equal(trickSumIsValid([2, 1, 1], 3), false);
  assert.equal(trickSumIsValid([0, 0, 0], 3), false);
});

test("Gesamtpunkte summieren alle gewerteten Runden", () => {
  const played = [{ scores: [20, -10, 30] }, { scores: [-20, 30, 20] }];
  assert.deepEqual(totalScores(3, played), [0, 20, 50]);
});

test("Platzierung sortiert absteigend und teilt Gleichstände", () => {
  const result = standings([40, 90, 40, 10]);
  assert.deepEqual(
    result.map((row) => [row.index, row.rank]),
    [
      [1, 1],
      [0, 2],
      [2, 2],
      [3, 4],
    ],
  );
});
