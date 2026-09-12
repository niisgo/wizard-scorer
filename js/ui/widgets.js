/* Wiederverwendbare Bausteine.

   Abschnitte stehen direkt auf der Seite unter einer Rubrik. Getrennt wird
   mit 1px schwarz; 2px schwarz umrandet, was man anfassen kann. */

import { append, el } from "../dom.js";

/**
 * @param {string} label
 * @param {object} options
 * @param {"primary"|"ghost"|"quiet"|"danger"} [options.variant]
 * @param {() => void} [options.onClick]
 * @param {boolean} [options.disabled]
 */
export function button(label, { variant = "primary", onClick, disabled = false, type = "button" } = {}) {
  return el("button", {
    class: `btn btn--${variant}`,
    type,
    text: label,
    disabled,
    onClick,
  });
}

/**
 * Abschnitt mit gesetzter Überschrift.
 *
 * @param {Array<Node|string|null|false>|Node} children
 * @param {object} [options]
 * @param {string} [options.title] Rubrik in Kapitälchen
 * @param {string} [options.aside] kleine Zusatzangabe rechts in der Rubrik
 */
export function section(children, { title, aside } = {}) {
  return el("section", { class: "section" }, [
    title
      ? el("h2", { class: "rubric" }, [
          el("span", { text: title }),
          aside ? el("span", { class: "rubric__aside", text: aside }) : null,
        ])
      : null,
    ...(Array.isArray(children) ? children : [children]),
  ]);
}

/** Hinweiszeile mit senkrechter Linie am Rand. */
export function note(text, tone = "info") {
  return el("p", {
    class: `note note--${tone}`,
    text,
    role: tone === "error" ? "alert" : null,
  });
}

/**
 * Zeile aus Bezeichnung und Wert, getrennt durch eine Haarlinie oben.
 *
 * @param {string} label
 * @param {string} value
 */
export function entry(label, value) {
  return el("div", { class: "entry" }, [
    el("span", { class: "entry__label", text: label }),
    el("span", { class: "entry__gap", "aria-hidden": "true" }),
    el("span", { class: "entry__value", text: value }),
  ]);
}

/**
 * Zahlenraster von 0 bis max - die Haupteingabe der App.
 *
 * @param {object} options
 * @param {number} options.max größte wählbare Zahl
 * @param {number|null} options.value aktuelle Auswahl
 * @param {number|null} [options.blocked] gesperrte Zahl (Hook-Regel)
 * @param {(value: number) => void} options.onPick
 * @param {string} [options.labelledBy]
 */
export function numberGrid({ max, value, blocked = null, onPick, labelledBy }) {
  const grid = el("div", {
    class: "numgrid",
    role: "radiogroup",
    "aria-labelledby": labelledBy,
  });

  for (let number = 0; number <= max; number += 1) {
    const isBlocked = number === blocked;
    append(
      grid,
      el("button", {
        class: "numgrid__cell",
        type: "button",
        role: "radio",
        text: String(number),
        "aria-checked": String(value === number),
        "aria-disabled": isBlocked ? "true" : null,
        disabled: isBlocked,
        title: isBlocked ? "Damit würde die Runde aufgehen" : null,
        onClick: () => onPick(number),
      }),
    );
  }

  return grid;
}

/**
 * Fortschritt als ein Balken je Runde - gespielte in Zinnober.
 *
 * @param {number} round aktuelle Runde
 * @param {number} total Runden insgesamt
 */
export function ticks(round, total) {
  const marks = [];
  for (let index = 1; index <= total; index += 1) {
    const state = index < round ? " is-played" : index === round ? " is-current" : "";
    marks.push(el("span", { class: `ticks__mark${state}`, "aria-hidden": "true" }));
  }

  return el(
    "div",
    {
      class: "ticks",
      role: "progressbar",
      "aria-valuemin": "1",
      "aria-valuemax": String(total),
      "aria-valuenow": String(round),
      "aria-label": `Runde ${round} von ${total}`,
    },
    marks,
  );
}
