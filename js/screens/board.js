/* Die Punkteübersicht - der Bildschirm, auf den die App zwischen allen
   Eingaben zurückkehrt. Der Hauptbutton zeigt immer den nächsten Schritt:
   schätzen, Runde beenden oder weiter zur nächsten Runde. */

import { resume } from "../flow.js";
import {
  cards,
  currentBids,
  isLastRound,
  isRoundScored,
  nextRound,
  roundsTotal,
  startBidding,
  startTricks,
} from "../game.js";
import { getGame, update } from "../store.js";
import { menuButton } from "../ui/menu.js";
import { historyTable, rankList } from "../ui/results.js";
import { button, section, ticks } from "../ui/widgets.js";

export function boardScreen() {
  const game = getGame();
  const rounds = roundsTotal(game);
  const bids = currentBids(game);
  const scored = isRoundScored(game);
  const count = cards(game);

  return {
    title: `Runde ${game.round} von ${rounds}`,
    subtitle: `${count} ${count === 1 ? "Karte" : "Karten"} · ${status(bids, scored)}`,
    aside: menuButton(),
    content: [
      ticks(game.round, rounds),
      section([rankList(game, { showRound: true, showDelta: scored })], {
        title: "Punktestand",
        aside: `nach ${scored ? game.round : game.round - 1} von ${rounds}`,
      }),
      historyTable(game),
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
    return [
      button(isLastRound(game) ? "Endstand ansehen" : "Nächste Runde", {
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
