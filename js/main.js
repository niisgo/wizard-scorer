/* Einstiegspunkt: Screens registrieren und dort weitermachen, wo die letzte
   Partie stehen geblieben ist. */

import { resume } from "./flow.js";
import { currentBids, startBidding, startTricks } from "./game.js";
import { register } from "./router.js";
import { bidsScreen } from "./screens/bids.js";
import { dealScreen } from "./screens/deal.js";
import { namesScreen } from "./screens/names.js";
import { startScreen } from "./screens/start.js";
import { tricksScreen } from "./screens/tricks.js";
import { getGame, update } from "./store.js";
import { button } from "./ui/widgets.js";

register("start", startScreen);
register("names", namesScreen);
register("deal", dealScreen);
register("bids", bidsScreen);
register("tricks", tricksScreen);

// Platzhalter, bis die Punkteübersicht steht.
register("board", () => {
  const ready = Boolean(currentBids(getGame()));
  return {
    title: "Punkte",
    actions: [
      button(ready ? "Runde beenden" : "Schätzen", {
        onClick: () => {
          update(ready ? startTricks : startBidding);
          resume();
        },
      }),
    ],
  };
});

resume();
