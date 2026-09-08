/* Einstiegspunkt: Screens registrieren und den ersten anzeigen. */

import { el } from "./dom.js";
import { go, register } from "./router.js";
import { namesScreen } from "./screens/names.js";
import { startScreen } from "./screens/start.js";

register("start", startScreen);
register("names", namesScreen);

// Platzhalter, bis der Runden-Screen steht.
register("deal", () => ({
  title: "Runde 1",
  content: [el("p", { text: "Der Runden-Ablauf kommt als naechstes." })],
}));

go("start");
