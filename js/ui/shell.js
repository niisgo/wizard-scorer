/* Zeichnet das Grundgeruest: Topbar, Inhalt, Actionbar.
   Jeder Screen liefert nur noch sein Beschreibungsobjekt. */

import { append, clear, el } from "../dom.js";

const refs = {
  topbar: document.getElementById("topbar"),
  screen: document.getElementById("screen"),
  actionbar: document.getElementById("actionbar"),
};

/**
 * @typedef {object} ScreenView
 * @property {string} [title] Ueberschrift in der Topbar
 * @property {string} [subtitle] kleine Zeile darunter
 * @property {{label: string, onClick: () => void}} [back] Zurueck-Knopf links
 * @property {Node} [aside] freies Element rechts in der Topbar
 * @property {Array<Node|string|null|false>} [content] Inhalt
 * @property {Array<Node|string|null|false>} [actions] Buttons am unteren Rand
 */

/** @param {ScreenView} view */
export function paint(view) {
  paintTopbar(view);

  clear(refs.screen);
  append(refs.screen, view.content ?? []);

  clear(refs.actionbar);
  append(refs.actionbar, view.actions ?? []);

  refs.screen.scrollTo?.({ top: 0 });
  window.scrollTo({ top: 0 });
}

function paintTopbar({ title, subtitle, back, aside }) {
  clear(refs.topbar);
  if (!title && !back && !aside) return;

  const leading = back
    ? el(
        "button",
        {
          class: "iconbtn",
          type: "button",
          "aria-label": back.label ?? "Zurück",
          onClick: back.onClick,
        },
        backArrow(),
      )
    : null;

  append(
    refs.topbar,
    el("div", { class: "topbar__row" }, [
      leading,
      el("div", { class: "topbar__titles" }, [
        title ? el("h1", { class: "topbar__title", text: title }) : null,
        subtitle ? el("p", { class: "topbar__subtitle", text: subtitle }) : null,
      ]),
      aside ?? null,
    ]),
  );
}

function backArrow() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("width", "22");
  svg.setAttribute("height", "22");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M15 5l-7 7 7 7");
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "currentColor");
  path.setAttribute("stroke-width", "2.2");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");

  svg.append(path);
  return svg;
}
