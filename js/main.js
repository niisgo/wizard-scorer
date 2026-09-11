/* Einstiegspunkt: Screens registrieren und dort weitermachen, wo die letzte
   Partie stehen geblieben ist. */

import { resume } from "./flow.js";
import { register } from "./router.js";
import { bidsScreen } from "./screens/bids.js";
import { boardScreen } from "./screens/board.js";
import { dealScreen } from "./screens/deal.js";
import { finalScreen } from "./screens/final.js";
import { namesScreen } from "./screens/names.js";
import { startScreen } from "./screens/start.js";
import { tricksScreen } from "./screens/tricks.js";

register("start", startScreen);
register("names", namesScreen);
register("deal", dealScreen);
register("board", boardScreen);
register("bids", bidsScreen);
register("tricks", tricksScreen);
register("final", finalScreen);

resume();
