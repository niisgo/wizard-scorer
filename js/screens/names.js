/* Namen eintragen. Vorbelegt mit den Namen der letzten Partie, damit die
   gleiche Runde nicht jedes Mal neu tippen muss. */

import { el } from "../dom.js";
import { createGame } from "../game.js";
import { go } from "../router.js";
import { recallNames, rememberNames, setGame } from "../store.js";
import { button, section } from "../ui/widgets.js";

export function namesScreen({ count }) {
  const draft = recallNames(count);
  const inputs = [];

  const fields = draft.map((name, index) => {
    const input = el("input", {
      class: "input",
      type: "text",
      value: name,
      placeholder: `Spieler ${index + 1}`,
      maxlength: 16,
      autocomplete: "off",
      autocapitalize: "words",
      spellcheck: "false",
      enterkeyhint: index === count - 1 ? "done" : "next",
      "aria-label": `Name von Spieler ${index + 1}`,
      onKeydown: (event) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        inputs[index + 1]?.focus();
        if (index === count - 1) event.currentTarget.blur();
      },
    });

    inputs.push(input);

    return el("label", { class: "namerow" }, [
      el("span", { class: "namerow__seat", text: String(index + 1) }),
      input,
    ]);
  });

  return {
    title: "Wer spielt mit?",
    subtitle: `${count} Spieler`,
    back: { label: "Zurück zur Spielerzahl", onClick: () => go("start") },
    content: [
      section(fields, { title: "Namen", aside: `${count} Spieler` }),
      el("p", {
        class: "hint",
        text: "Leere Felder werden automatisch zu Spieler 1, Spieler 2 und so weiter.",
      }),
    ],
    actions: [
      button("Spiel starten", {
        onClick: () => {
          const names = inputs.map(
            (input, index) => input.value.trim() || `Spieler ${index + 1}`,
          );
          rememberNames(names);
          setGame(createGame(names));
          go("deal");
        },
      }),
    ],
  };
}
