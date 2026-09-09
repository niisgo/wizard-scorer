/* Wiederverwendbare Bausteine: Buttons, Karten, Zahlenfelder. */

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

/** Karte mit optionaler Überschrift. */
export function card(children, { title, class: extra = "" } = {}) {
  return el("section", { class: `card ${extra}`.trim() }, [
    title ? el("h2", { class: "card__title", text: title }) : null,
    ...(Array.isArray(children) ? children : [children]),
  ]);
}

/** Hinweiszeile, z.B. für Regelverstöße. */
export function note(text, tone = "info") {
  return el("p", { class: `note note--${tone}`, text, role: tone === "error" ? "alert" : null });
}

/**
 * Raster aus Zahl-Knöpfen von 0 bis max - die Haupteingabe der App.
 * Groß genug für den Daumen, ohne Tastatur.
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
 * Schmaler Fortschrittsbalken über die Partie.
 *
 * @param {number} round aktuelle Runde
 * @param {number} total Runden insgesamt
 */
export function roundProgress(round, total) {
  return el(
    "div",
    {
      class: "progress",
      role: "progressbar",
      "aria-valuemin": "1",
      "aria-valuemax": String(total),
      "aria-valuenow": String(round),
      "aria-label": `Runde ${round} von ${total}`,
    },
    el("span", {
      class: "progress__bar",
      style: `width: ${(round / total) * 100}%`,
    }),
  );
}

/** Zeile "Spieler - Wert" für Übersichten. */
export function statRow(label, value, { tone = "" } = {}) {
  return el("div", { class: "statrow" }, [
    el("span", { class: "statrow__label", text: label }),
    el("span", { class: `statrow__value ${tone}`.trim(), text: value }),
  ]);
}
