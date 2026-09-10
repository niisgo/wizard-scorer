/* Die Punkteübersicht - der Bildschirm, auf den die App zwischen allen
   Eingaben zurückkehrt. Der Hauptbutton zeigt immer den nächsten Schritt:
   schätzen, Runde beenden oder weiter zur nächsten Runde. */

import { el, signed } from "../dom.js";
import { resume } from "../flow.js";
import {
  cards,
  currentBids,
  currentTricks,
  isLastRound,
  isRoundScored,
  nextRound,
  roundEntry,
  roundsTotal,
  startBidding,
  startTricks,
  totals,
} from "../game.js";
import { standings } from "../rules.js";
import { getGame, update } from "../store.js";
import { button, card, roundProgress } from "../ui/widgets.js";

export function boardScreen() {
  const game = getGame();
  const rounds = roundsTotal(game);
  const bids = currentBids(game);
  const scored = isRoundScored(game);
  const count = cards(game);

  return {
    title: `Runde ${game.round} von ${rounds}`,
    subtitle: `${count} ${count === 1 ? "Karte" : "Karten"} · ${status(bids, scored)}`,
    content: [
      roundProgress(game.round, rounds),
      ranking(game, scored),
      history(game),
    ],
    actions: mainActions(game, { bids, scored }),
  };
}

function status(bids, scored) {
  if (scored) return "gewertet";
  if (bids) return "Ansagen stehen";
  return "noch keine Ansagen";
}

function mainActions(game, { bids, scored }) {
  if (scored) {
    const last = isLastRound(game);
    return [
      button(last ? "Endstand ansehen" : "Nächste Runde", {
        onClick: () => {
          update(nextRound);
          resume();
        },
      }),
    ];
  }

  if (bids) {
    return [
      button("Runde beenden", {
        onClick: () => {
          update(startTricks);
          resume();
        },
      }),
      button("Ansagen ändern", {
        variant: "quiet",
        onClick: () => {
          update(startBidding);
          resume();
        },
      }),
    ];
  }

  return [
    button("Schätzen", {
      onClick: () => {
        update(startBidding);
        resume();
      },
    }),
  ];
}

/** Spieler nach Punkten sortiert, mit dem Ergebnis der laufenden Runde. */
function ranking(game, scored) {
  const points = totals(game);
  const entry = roundEntry(game);
  const bids = currentBids(game);
  const tricks = currentTricks(game);

  const rows = standings(points).map(({ index, total, rank }) => {
    const delta = scored ? entry.scores[index] : null;

    return el("li", { class: "rankrow" }, [
      el("span", { class: `rankrow__pos${rank === 1 ? " is-lead" : ""}`, text: String(rank) }),
      el("span", { class: "rankrow__body" }, [
        el("span", { class: "rankrow__name", text: game.players[index] }),
        detail(bids?.[index], tricks?.[index]),
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

function detail(bid, trick) {
  if (bid === undefined || bid === null) return null;
  const text =
    trick === undefined || trick === null
      ? `angesagt ${bid}`
      : `angesagt ${bid} · geholt ${trick}`;
  return el("span", { class: "rankrow__sub", text });
}

/** Aufklappbarer Rundenverlauf: eine Zeile je gespielter Runde. */
function history(game) {
  const played = game.rounds.filter((round) => round?.scores).length;
  if (played === 0) return null;

  const head = el("tr", {}, [
    el("th", { scope: "col", text: "Rd" }),
    ...game.players.map((name) => el("th", { scope: "col", text: name })),
  ]);

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

  const details = el("details", { class: "history" }, [
    el("summary", { class: "history__summary", text: `Rundenverlauf (${played})` }),
    el("div", { class: "history__scroll" }, [
      el("table", { class: "history__table" }, [
        el("thead", {}, head),
        el("tbody", {}, body),
      ]),
    ]),
  ]);

  return card([details], { class: "card--flush" });
}
