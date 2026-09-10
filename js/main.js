/* Einstiegspunkt: Screens registrieren und dort weitermachen, wo die letzte
   Partie stehen geblieben ist. */

import { el } from "./dom.js";
import { resume } from "./flow.js";
import { register } from "./router.js";
import { bidsScreen } from "./screens/bids.js";
import { boardScreen } from "./screens/board.js";
import { dealScreen } from "./screens/deal.js";
import { namesScreen } from "./screens/names.js";
import { startScreen } from "./screens/start.js";
import { tricksScreen } from "./screens/tricks.js";

register("start", startScreen);
register("names", namesScreen);
register("deal", dealScreen);
register("board", boardScreen);
register("bids", bidsScreen);
register("tricks", tricksScreen);

// Platzhalter, bis die Schlusstabelle steht.
register("final", () => ({
  title: "Endstand",
  content: [el("p", { text: "Die Schlusstabelle kommt als nächstes." })],
}));

resume();
