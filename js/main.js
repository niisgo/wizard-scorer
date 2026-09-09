/* Einstiegspunkt: Screens registrieren und dort weitermachen, wo die letzte
   Partie stehen geblieben ist. */

import { resume } from "./flow.js";
import { startBidding } from "./game.js";
import { register } from "./router.js";
import { bidsScreen } from "./screens/bids.js";
import { dealScreen } from "./screens/deal.js";
import { namesScreen } from "./screens/names.js";
import { startScreen } from "./screens/start.js";
import { update } from "./store.js";
import { button } from "./ui/widgets.js";

register("start", startScreen);
register("names", namesScreen);
register("deal", dealScreen);
register("bids", bidsScreen);

// Platzhalter, bis die Punkteübersicht steht.
register("board", () => ({
  title: "Punkte",
  actions: [
    button("Schätzen", {
      onClick: () => {
        update(startBidding);
        resume();
      },
    }),
  ],
}));

resume();
