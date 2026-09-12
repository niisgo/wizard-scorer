/* Nach der Runde: Wer hat wie viele Stiche wirklich geholt?
   Die Summe muss exakt der Kartenzahl entsprechen, sonst hat sich jemand
   verzählt - erst dann lässt sich die Runde werten. */

import { buzz, el } from "../dom.js";
import { resume } from "../flow.js";
import {
  cards,
  currentBids,
  currentTricks,
  submitTricks,
  toBoard,
} from "../game.js";
import { refresh } from "../router.js";
import { getGame, update } from "../store.js";
import { button, note, numberGrid, section } from "../ui/widgets.js";

let session = null;

export function tricksScreen() {
  const game = getGame();
  const count = cards(game);
  const bids = currentBids(game) ?? [];

  if (session?.round !== game.round) {
    session = {
      round: game.round,
      values: currentTricks(game)?.slice() ?? new Array(game.players.length).fill(null),
      open: 0,
    };
  }

  const entered = session.values.reduce((total, value) => total + (value ?? 0), 0);
  const complete = session.values.every((value) => value !== null);
  const exact = complete && entered === count;

  return {
    title: "Stiche eintragen",
    subtitle: `Runde ${game.round} · ${count} ${count === 1 ? "Stich" : "Stiche"} zu verteilen`,
    back: {
      label: "Zurück zur Übersicht",
      onClick: () => {
        session = null;
        update(toBoard);
        resume();
      },
    },
    content: [
      section(
        [
          el(
            "ul",
            { class: "tricklist" },
            game.players.map((name, seat) => row({ name, seat, bid: bids[seat], count })),
          ),
          summary({ entered, count, complete, exact }),
        ],
        { title: "Geholte Stiche", aside: `${entered} von ${count}` },
      ),
    ],
    actions: [
      button("Runde werten", {
        disabled: !exact,
        onClick: () => {
          update((current) => submitTricks(current, session.values));
          session = null;
          resume();
        },
      }),
    ],
  };
}

function row({ name, seat, bid, count }) {
  const value = session.values[seat];
  const open = session.open === seat;
  const hit = value !== null && value === bid;

  return el("li", { class: `trickrow${open ? " is-open" : ""}` }, [
    el(
      "button",
      {
        class: "trickrow__head",
        type: "button",
        "aria-expanded": String(open),
        onClick: () => {
          session.open = open ? null : seat;
          refresh();
        },
      },
      [
        el("span", { class: "trickrow__name", text: name }),
        el("span", { class: "trickrow__bid", text: `angesagt ${bid ?? "?"}` }),
        el("span", {
          class: `trickrow__value${value === null ? " is-empty" : ""}${hit ? " is-hit" : ""}`,
          text: value === null ? "–" : String(value),
        }),
      ],
    ),
    open
      ? numberGrid({
          max: count,
          value,
          onPick: (picked) => {
            buzz();
            session.values[seat] = picked;
            session.open = session.values.findIndex((entry) => entry === null);
            if (session.open === -1) session.open = null;
            refresh();
          },
        })
      : null,
  ]);
}

function summary({ entered, count, complete, exact }) {
  if (exact) {
    return note(`${entered} von ${count} Stichen verteilt – passt.`, "good");
  }
  if (!complete) {
    const missing = count - entered;
    return note(
      missing > 0
        ? `Es fehlen noch ${missing} von ${count} Stichen.`
        : `Bereits ${entered - count} Stiche zu viel eingetragen.`,
    );
  }
  return note(
    entered > count
      ? `${entered} Stiche eingetragen, es gibt aber nur ${count}. Da hat sich jemand verzählt.`
      : `Erst ${entered} von ${count} Stichen eingetragen.`,
    "error",
  );
}
