/* Einstiegspunkt: Screens registrieren und dort weitermachen, wo die letzte
   Partie stehen geblieben ist. */

import { resume } from "./flow.js";
import { onInstallChange, registerServiceWorker } from "./pwa.js";
import { currentScreen, refresh, register } from "./router.js";
import { bidsScreen } from "./screens/bids.js";
import { boardScreen } from "./screens/board.js";
import { dealScreen } from "./screens/deal.js";
import { finalScreen } from "./screens/final.js";
import { namesScreen } from "./screens/names.js";
import { startScreen } from "./screens/start.js";
import { tricksScreen } from "./screens/tricks.js";
import { applyTheme } from "./theme.js";
import { initWakeLock } from "./wakelock.js";

register("start", startScreen);
register("names", namesScreen);
register("deal", dealScreen);
register("board", boardScreen);
register("bids", bidsScreen);
register("tricks", tricksScreen);
register("final", finalScreen);

applyTheme();
initWakeLock();
registerServiceWorker();

// Der Browser meldet erst nach ein paar Sekunden, ob installiert werden kann.
onInstallChange(() => {
  if (currentScreen() === "start") refresh();
});

resume();
