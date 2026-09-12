/* Titelseite: Spielerzahl wählen - oder die letzte Partie fortsetzen. */

import { el } from "../dom.js";
import { resume } from "../flow.js";
import { roundsTotal } from "../game.js";
import { canInstall, promptInstall } from "../pwa.js";
import { MAX_PLAYERS, MIN_PLAYERS, totalRounds } from "../rules.js";
import { go } from "../router.js";
import { getGame } from "../store.js";
import { button, entry, section } from "../ui/widgets.js";

let chosenCount = 4;

export function startScreen() {
  const running = getGame();

  return {
    content: [wordmark(), running && resumeSection(running), playerPicker()],
    actions: [
      button(running ? "Neues Spiel" : "Weiter", {
        variant: running ? "ghost" : "primary",
        onClick: () => go("names", { count: chosenCount }),
      }),
      canInstall() &&
        button("Auf dem Homescreen ablegen", {
          variant: "quiet",
          onClick: promptInstall,
        }),
    ],
  };
}

function wordmark() {
  return el("div", { class: "wordmark" }, [
    el("p", { class: "wordmark__eyebrow", text: "Punkteblock" }),
    el("h1", { class: "wordmark__name", text: "Wizard" }),
    el("div", { class: "wordmark__bar", "aria-hidden": "true" }),
    el("p", {
      class: "wordmark__lead",
      text: "Die App sagt an, was ausgeteilt wird, passt auf die Ansagen auf und rechnet. Ihr spielt.",
    }),
  ]);
}

function resumeSection(game) {
  return section(
    [
      entry("Spieler", game.players.join(", ")),
      entry("Steht bei", `Runde ${game.round} von ${roundsTotal(game)}`),
      button("Weiterspielen", { onClick: resume }),
    ],
    { title: "Angefangene Partie" },
  );
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
        for (const option of event.currentTarget.parentElement.children) {
          option.setAttribute("aria-checked", String(option === event.currentTarget));
        }
        hint.textContent = hintFor(count);
      },
    }),
  );

  return section(
    [
      el("div", { class: "picker", role: "radiogroup", "aria-label": "Anzahl der Spieler" }, options),
      hint,
    ],
    { title: "Wie viele Spieler?" },
  );
}

function hintFor(count) {
  return `Das Blatt reicht für ${totalRounds(count)} Runden.`;
}
