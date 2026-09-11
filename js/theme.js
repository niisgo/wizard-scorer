/* Design: der Einstellung des Systems folgen - oder fest hell/dunkel. */

import { KEYS, read, write } from "./storage.js";

export const THEMES = [
  { value: "system", label: "System" },
  { value: "dark", label: "Dunkel" },
  { value: "light", label: "Hell" },
];

let current = normalize(read(KEYS.theme, "system"));

export const getTheme = () => current;

export function setTheme(value) {
  current = normalize(value);
  write(KEYS.theme, current);
  applyTheme();
}

export function applyTheme() {
  const root = document.documentElement;

  if (current === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", current);

  // Die Statusleiste von Android/iOS soll zur Seite passen.
  const background = getComputedStyle(root).getPropertyValue("--bg").trim();
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", background);
}

function normalize(value) {
  return THEMES.some((theme) => theme.value === value) ? value : "system";
}
