/* Schlusstabelle nach der letzten Runde. */

import { el } from "../dom.js";
import { resume } from "../flow.js";
import { createGame, roundsTotal, totals } from "../game.js";
import { standings } from "../rules.js";
import { go } from "../router.js";
import { getGame, setGame } from "../store.js";
import { historyCard, rankList } from "../ui/results.js";
import { button } from "../ui/widgets.js";

export function finalScreen() {
  const game = getGame();
  const table = standings(totals(game));
  const winners = table.filter((row) => row.rank === 1);

  return {
    title: "Endstand",
    subtitle: `${roundsTotal(game)} Runden · ${game.players.length} Spieler`,
    content: [
      trophy(game, winners),
      rankList(game),
      historyCard(game),
    ],
    actions: [
      button("Nochmal mit denselben Spielern", {
        onClick: () => {
          setGame(createGame(game.players));
          resume();
        },
      }),
      button("Partie beenden", {
        variant: "quiet",
        onClick: () => {
          setGame(null);
          go("start");
        },
      }),
    ],
  };
}

function trophy(game, winners) {
  const names = winners.map((row) => game.players[row.index]);
  const points = winners[0].total;

  return el("div", { class: "trophy" }, [
    el("span", { class: "trophy__crown", "aria-hidden": "true", text: "♛" }),
    el("p", { class: "trophy__name", text: joinNames(names) }),
    el("p", {
      class: "trophy__line",
      text:
        names.length === 1
          ? `gewinnt mit ${points} Punkten`
          : `teilen sich den Sieg mit ${points} Punkten`,
    }),
  ]);
}

function joinNames(names) {
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")} und ${names.at(-1)}`;
}
