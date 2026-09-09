/* Einstiegspunkt: Screens registrieren und dort weitermachen, wo die letzte
   Partie stehen geblieben ist. */

import { el } from "./dom.js";
import { resume } from "./flow.js";
import { register } from "./router.js";
import { dealScreen } from "./screens/deal.js";
import { namesScreen } from "./screens/names.js";
import { startScreen } from "./screens/start.js";

register("start", startScreen);
register("names", namesScreen);
register("deal", dealScreen);

// Platzhalter, bis Übersicht, Ansagen und Stiche stehen.
register("board", () => ({
  title: "Punkte",
  content: [el("p", { text: "Die Punkteübersicht kommt als nächstes." })],
}));

resume();
