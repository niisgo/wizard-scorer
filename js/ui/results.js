/* Rangliste und Rundenverlauf - geteilt von der Punkteübersicht und der
   Schlusstabelle. */

import { el, signed } from "../dom.js";
import { currentBids, currentTricks, roundEntry, totals } from "../game.js";
import { standings } from "../rules.js";
import { card } from "./widgets.js";

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

    return el("li", { class: `rankrow${rank === 1 ? " is-lead" : ""}` }, [
      el("span", {
        class: `rankrow__pos${rank === 1 ? " is-lead" : ""}`,
        text: String(rank),
      }),
      el("span", { class: "rankrow__body" }, [
        el("span", { class: "rankrow__name", text: game.players[index] }),
        roundDetail(bids?.[index], tricks?.[index]),
      ]),
      el("span", { class: "rankrow__score" }, [
        el("span", { class: "rankrow__total", text: String(total) }),
        delta === null
          ? null
          : el("span", {
              class: `delta ${delta >= 0 ? "delta--good" : "delta--bad"}`,
              text: signed(delta),
            }),
      ]),
    ]);
  });

  return el("ul", { class: "ranklist" }, rows);
}

function roundDetail(bid, trick) {
  if (bid === undefined || bid === null) return null;
  return el("span", {
    class: "rankrow__sub",
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
export function historyCard(game, open = false) {
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
        el("th", { scope: "row", text: String(index + 1) }),
        ...round.scores.map((score, seat) =>
          el("td", {}, [
            el("span", {
              class: `history__delta ${score >= 0 ? "is-good" : "is-bad"}`,
              text: signed(score),
            }),
            el("span", { class: "history__running", text: String(running[seat]) }),
          ]),
        ),
      ]),
    );
  });

  const details = el("details", { class: "history", open }, [
    el("summary", {
      class: "history__summary",
      text: `Rundenverlauf (${played} ${played === 1 ? "Runde" : "Runden"})`,
    }),
    el("div", { class: "history__scroll" }, [
      el("table", { class: "history__table" }, [
        el(
          "thead",
          {},
          el("tr", {}, [
            el("th", { scope: "col", text: "Rd" }),
            ...game.players.map((name) => el("th", { scope: "col", text: name })),
          ]),
        ),
        el("tbody", {}, body),
      ]),
    ]),
  ]);

  return card([details], { class: "card--flush" });
}
