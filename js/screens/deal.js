/* Die Austeil-Ansage: "In dieser Runde bekommt jeder 3 Karten."
   Erst wenn das bestätigt ist, geht es zur Punkteübersicht. */

import { el } from "../dom.js";
import { resume } from "../flow.js";
import { bidOrder, cards, confirmDeal, dealer, roundsTotal } from "../game.js";
import { getGame, update } from "../store.js";
import { menuButton } from "../ui/menu.js";
import { button, entry, note, section, ticks } from "../ui/widgets.js";

export function dealScreen() {
  const game = getGame();
  const rounds = roundsTotal(game);
  const count = cards(game);
  const dealerName = game.players[dealer(game)];
  const firstBidder = game.players[bidOrder(game)[0]];

  return {
    title: `Runde ${game.round}`,
    subtitle: `von ${rounds} · ${game.players.length} Spieler`,
    aside: menuButton(),
    content: [
      ticks(game.round, rounds),
      section([announcement(count)], {
        title: "Jetzt austeilen",
        aside: `Runde ${game.round}/${rounds}`,
      }),
      section([entry("Gibt", dealerName), entry("Sagt zuerst an", firstBidder)], {
        title: "Am Zug",
      }),
      note(`${dealerName} sagt zuletzt an und darf die Runde nicht aufgehen lassen.`),
    ],
    actions: [
      button("Ausgeteilt", {
        onClick: () => {
          update(confirmDeal);
          resume();
        },
      }),
    ],
  };
}

function announcement(count) {
  return el("div", { class: "deal" }, [
    el("p", { class: "deal__count", text: String(count), "aria-hidden": "true" }),
    el("p", {
      class: "deal__unit",
      text: count === 1 ? "Karte pro Spieler" : "Karten pro Spieler",
    }),
    // Für Screenreader die ganze Aussage in einem Stück.
    el("p", {
      class: "visually-hidden",
      text: `${count} ${count === 1 ? "Karte" : "Karten"} pro Spieler austeilen.`,
    }),
  ]);
}
