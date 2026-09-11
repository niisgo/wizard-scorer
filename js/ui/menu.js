/* Das Menü der laufenden Partie: korrigieren, einstellen, abbrechen.
   Liegt als Bottom-Sheet über dem Screen, damit es auch einhändig
   erreichbar bleibt. */

import { append, clear, el } from "../dom.js";
import { resume } from "../flow.js";
import { roundEntry, undoLastScoredRound } from "../game.js";
import { go } from "../router.js";
import { getGame, setGame } from "../store.js";
import { THEMES, getTheme, setTheme } from "../theme.js";
import * as wakeLock from "../wakelock.js";

export function openGameMenu() {
  const dialog = el("dialog", { class: "sheet", "aria-label": "Menü" });
  const body = el("div", { class: "sheet__body" });

  // Nicht auf das close-Event verlassen: manche Engines feuern es nicht,
  // und ein unsichtbar liegengebliebenes <dialog> sammelt sich an.
  const close = () => {
    dialog.close();
    dialog.remove();
  };

  renderMenu(body, { close });

  append(dialog, [
    el("div", { class: "sheet__grip", "aria-hidden": "true" }),
    body,
    el("button", { class: "btn btn--ghost", type: "button", text: "Schließen", onClick: close }),
  ]);

  // Escape und Tipp auf den Hintergrund schließen ebenfalls.
  dialog.addEventListener("cancel", () => dialog.remove());
  dialog.addEventListener("close", () => dialog.remove());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) close();
  });

  document.body.append(dialog);
  dialog.showModal();
}

function renderMenu(body, { close }) {
  const game = getGame();
  const undoable = lastScoredRound(game);

  clear(body);
  append(body, [
    undoable
      ? action({
          label: "Letzte Wertung zurücknehmen",
          hint: `Runde ${undoable} – die Ansagen bleiben stehen, die Stiche werden neu eingetragen.`,
          onSelect: () => {
            const next = undoLastScoredRound(getGame());
            if (next) setGame(next);
            close();
            resume();
          },
        })
      : action({
          label: "Letzte Wertung zurücknehmen",
          hint: "Noch keine Runde gewertet.",
          disabled: true,
        }),

    segment({
      label: "Design",
      options: THEMES,
      value: getTheme(),
      onSelect: (value) => {
        setTheme(value);
        renderMenu(body, { close });
      },
    }),

    wakeLock.isSupported()
      ? toggle({
          label: "Bildschirm anlassen",
          hint: "Verhindert, dass das Display während der Partie zugeht.",
          value: wakeLock.isEnabled(),
          onSelect: async (value) => {
            await wakeLock.setEnabled(value);
            renderMenu(body, { close });
          },
        })
      : null,

    dangerZone({ close }),
  ]);
}

/* --- Bausteine ----------------------------------------------------------- */

function action({ label, hint, onSelect, disabled = false, tone = "" }) {
  return el(
    "button",
    {
      class: `sheetrow sheetrow--button ${tone}`.trim(),
      type: "button",
      disabled,
      onClick: onSelect,
    },
    [
      el("span", { class: "sheetrow__label", text: label }),
      hint ? el("span", { class: "sheetrow__hint", text: hint }) : null,
    ],
  );
}

function segment({ label, options, value, onSelect }) {
  return el("div", { class: "sheetrow" }, [
    el("span", { class: "sheetrow__label", text: label }),
    el(
      "div",
      { class: "segment", role: "radiogroup", "aria-label": label },
      options.map((option) =>
        el("button", {
          class: "segment__option",
          type: "button",
          role: "radio",
          text: option.label,
          "aria-checked": String(option.value === value),
          onClick: () => onSelect(option.value),
        }),
      ),
    ),
  ]);
}

function toggle({ label, hint, value, onSelect }) {
  return el(
    "button",
    {
      class: "sheetrow sheetrow--button sheetrow--toggle",
      type: "button",
      role: "switch",
      "aria-checked": String(value),
      onClick: () => onSelect(!value),
    },
    [
      el("span", { class: "sheetrow__label", text: label }),
      hint ? el("span", { class: "sheetrow__hint", text: hint }) : null,
      el("span", { class: "switch", "aria-hidden": "true" }, el("span", { class: "switch__knob" })),
    ],
  );
}

/** Abbrechen fragt nach - ein Fehlgriff kostet sonst die ganze Partie. */
function dangerZone({ close }) {
  const holder = el("div", { class: "sheet__danger" });

  const ask = () =>
    clear(holder).append(
      action({
        label: "Partie abbrechen",
        hint: "Punkte und Runden werden gelöscht.",
        tone: "is-danger",
        onSelect: confirm,
      }),
    );

  const confirm = () =>
    clear(holder).append(
      el("p", { class: "sheetrow__hint", text: "Wirklich abbrechen? Die Punkte sind dann weg." }),
      el("div", { class: "sheet__confirm" }, [
        el("button", {
          class: "btn btn--danger",
          type: "button",
          text: "Ja, abbrechen",
          onClick: () => {
            setGame(null);
            close();
            go("start");
          },
        }),
        el("button", { class: "btn btn--ghost", type: "button", text: "Nein", onClick: ask }),
      ]),
    );

  ask();
  return holder;
}

function lastScoredRound(game) {
  for (let round = game.rounds.length; round >= 1; round -= 1) {
    if (roundEntry(game, round)?.scores) return round;
  }
  return null;
}

/* Kleiner Helfer für die Topbar. */
export function menuButton() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "22");
  svg.setAttribute("height", "22");
  svg.setAttribute("aria-hidden", "true");

  for (const cy of [6, 12, 18]) {
    const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dot.setAttribute("cx", "12");
    dot.setAttribute("cy", String(cy));
    dot.setAttribute("r", "1.8");
    dot.setAttribute("fill", "currentColor");
    svg.append(dot);
  }

  return el(
    "button",
    {
      class: "iconbtn",
      type: "button",
      "aria-label": "Menü",
      onClick: openGameMenu,
    },
    svg,
  );
}
