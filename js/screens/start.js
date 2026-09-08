/* Startbildschirm: Spielerzahl waehlen - oder die letzte Partie fortsetzen. */

import { el } from "../dom.js";
import { MAX_PLAYERS, MIN_PLAYERS, totalRounds } from "../rules.js";
import { go } from "../router.js";
import { button, card } from "../ui/widgets.js";

let chosenCount = 4;

export function startScreen() {
  return {
    content: [hero(), playerPicker()],
    actions: [
      button("Weiter", { onClick: () => go("names", { count: chosenCount }) }),
    ],
  };
}

function hero() {
  return el("div", { class: "hero" }, [
    el("p", { class: "hero__eyebrow", text: "Digitaler Punkteblock" }),
    el("h1", { class: "hero__title", text: "Wizard" }),
    el("p", {
      class: "hero__lead",
      text: "Kartenanzahl ansagen, Stiche schätzen, Punkte automatisch berechnen. Kein Zettel, kein Kopfrechnen.",
    }),
  ]);
}

function playerPicker() {
  const counts = [];
  for (let count = MIN_PLAYERS; count <= MAX_PLAYERS; count += 1) counts.push(count);

  const hint = el("p", { class: "picker__hint", text: hintFor(chosenCount) });

  const options = counts.map((count) =>
    el("button", {
      class: "picker__option",
      type: "button",
      role: "radio",
      text: String(count),
      "aria-checked": String(count === chosenCount),
      onClick: (event) => {
        chosenCount = count;
        const group = event.currentTarget.parentElement;
        for (const option of group.children) {
          option.setAttribute("aria-checked", String(option === event.currentTarget));
        }
        hint.textContent = hintFor(count);
      },
    }),
  );

  return card(
    [
      el("div", { class: "picker", role: "radiogroup", "aria-label": "Anzahl der Spieler" }, options),
      hint,
    ],
    { title: "Wie viele Spieler?" },
  );
}

function hintFor(count) {
  return `${count} Spieler – das Blatt reicht für ${totalRounds(count)} Runden.`;
}
