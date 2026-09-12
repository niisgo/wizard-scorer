/* Rangliste und Rundenverlauf - geteilt von der Punkteübersicht und der
   Schlussseite. Beide Listen sind gleich gebaut: der Platz im vollen
   Kästchen, der Name in Versalien, die Punktzahl rechts. */

import { el, signed } from "../dom.js";
import { currentBids, currentTricks, roundEntry, totals } from "../game.js";
import { standings } from "../rules.js";

/**
 * Spieler nach Punkten sortiert.
 *
 * @param {object} game
 * @param {object} [options]
 * @param {boolean} [options.showRound] Ansage/Stiche der laufenden Runde zeigen
 * @param {boolean} [options.showDelta] Punkte der laufenden Runde zeigen
 */
export function rankList(game, { showRound = false, showDelta = false } = {}) {
  const entry = roundEntry(game);
  const bids = showRound ? currentBids(game) : null;
  const tricks = showRound ? currentTricks(game) : null;

  const rows = standings(totals(game)).map(({ index, total, rank }) => {
    const delta = showDelta ? (entry?.scores?.[index] ?? null) : null;

    return el("li", { class: `ledger__row${rank === 1 ? " is-lead" : ""}` }, [
      el("span", { class: "ledger__rank", text: String(rank) }),
      el("span", { class: "ledger__who" }, [
        el("span", { class: "ledger__name", text: game.players[index] }),
        roundDetail(bids?.[index], tricks?.[index]),
      ]),
      el("span", { class: "ledger__gap", "aria-hidden": "true" }),
      delta === null
        ? null
        : el("span", {
            class: `ledger__delta ${delta >= 0 ? "is-gain" : "is-loss"}`,
            text: signed(delta),
          }),
      el("span", { class: "ledger__total", text: String(total) }),
    ]);
  });

  return el("ol", { class: "ledger" }, rows);
}

function roundDetail(bid, trick) {
  if (bid === undefined || bid === null) return null;
  return el("span", {
    class: "ledger__sub",
    text:
      trick === undefined || trick === null
        ? `angesagt ${bid}`
        : `angesagt ${bid} · geholt ${trick}`,
  });
}

/**
 * Aufklappbarer Rundenverlauf: je Runde die Punkte und der Zwischenstand.
 *
 * @param {object} game
 * @param {boolean} [open] von Anfang an aufgeklappt
 */
export function historyTable(game, open = false) {
  const played = game.rounds.filter((round) => round?.scores).length;
  if (played === 0) return null;

  const running = new Array(game.players.length).fill(0);
  const body = [];

  game.rounds.forEach((round, index) => {
    if (!round?.scores) return;
    round.scores.forEach((score, seat) => {
      running[seat] += score;
    });

    body.push(
      el("tr", {}, [
        el("th", { scope: "row", text: `Runde ${index + 1}` }),
        ...round.scores.map((score, seat) =>
          el("td", {}, [
            el("span", {
              class: `history__delta ${score >= 0 ? "is-gain" : "is-loss"}`,
              text: signed(score),
            }),
            el("span", { class: "history__running", text: String(running[seat]) }),
          ]),
        ),
      ]),
    );
  });

  return el("details", { class: "history", open }, [
    el("summary", {
      class: "history__summary",
      text: `Rundenverlauf · ${played} ${played === 1 ? "Runde" : "Runden"}`,
    }),
    el("div", { class: "history__scroll" }, [
      el("table", { class: "history__table" }, [
        el(
          "thead",
          {},
          el("tr", {}, [
            el("th", { scope: "col", text: "" }),
            ...game.players.map((name) => el("th", { scope: "col", text: name })),
          ]),
        ),
        el("tbody", {}, body),
      ]),
    ]),
  ]);
}
