/* Die Ansagen werden reihum eingetragen - links vom Geber beginnend, der
   Geber zuletzt. Wer zuletzt dran ist, bekommt die Zahl gesperrt, mit der
   die Runde aufgehen würde. */

import { buzz, el } from "../dom.js";
import { resume } from "../flow.js";
import { bidOrder, cards, currentBids, submitBids, toBoard } from "../game.js";
import { forbiddenBid } from "../rules.js";
import { refresh } from "../router.js";
import { getGame, update } from "../store.js";
import { note, numberGrid, section } from "../ui/widgets.js";

/** Zwischenstand der laufenden Eingabe, damit ein Re-Render nichts verliert. */
let session = null;

export function bidsScreen() {
  const game = getGame();
  const order = bidOrder(game);
  const count = cards(game);

  if (session?.round !== game.round) {
    session = {
      round: game.round,
      // Beim Korrigieren stehen die alten Ansagen schon drin.
      values: currentBids(game)?.slice() ?? new Array(game.players.length).fill(null),
      step: 0,
    };
  }

  const seat = order[session.step];
  const isLast = session.step === order.length - 1;
  const announced = order.slice(0, session.step).map((index) => session.values[index]);
  const blocked = isLast ? forbiddenBid(count, announced) : null;
  const alreadyAnnounced = announced.reduce((total, value) => total + value, 0);

  return {
    title: "Ansagen",
    subtitle: `Runde ${game.round} · ${count} ${count === 1 ? "Karte" : "Karten"}`,
    back: { label: "Einen Schritt zurück", onClick: stepBack },
    content: [
      slate(game, order, session.step),
      el("div", { class: "turn" }, [
        el("p", { class: "turn__label", text: "Wie viele Stiche holt" }),
        el("p", { class: "turn__name", text: game.players[seat] }),
      ]),
      section(
        [
          numberGrid({
            max: count,
            value: session.values[seat],
            blocked,
            onPick: (value) => pick(value, seat, isLast),
          }),
          hint({ count, alreadyAnnounced, blocked, isLast }),
        ],
        { title: "Ansage", aside: `${alreadyAnnounced} von ${count} angesagt` },
      ),
    ],
  };
}

function pick(value, seat, isLast) {
  buzz();
  session.values[seat] = value;

  if (!isLast) {
    session.step += 1;
    refresh();
    return;
  }

  update((game) => submitBids(game, session.values));
  session = null;
  resume();
}

function stepBack() {
  if (session && session.step > 0) {
    session.step -= 1;
    refresh();
    return;
  }
  session = null;
  update(toBoard);
  resume();
}

/** Die Tafel: wer ist durch, wer ist dran, wer kommt noch. */
function slate(game, order, step) {
  return el(
    "div",
    { class: "slate" },
    order.map((seat, position) => {
      const done = position < step;
      const current = position === step;

      return el(
        "div",
        {
          class: `slate__seat${current ? " is-current" : ""}${done ? " is-done" : ""}`,
        },
        [
          el("span", { class: "slate__name", text: game.players[seat] }),
          el("span", {
            class: "slate__bid",
            text: done ? String(session.values[seat]) : current ? "?" : "·",
          }),
          done
            ? el("button", {
                class: "slate__edit",
                type: "button",
                "aria-label": `Ansage von ${game.players[seat]} korrigieren`,
                onClick: () => {
                  session.step = position;
                  refresh();
                },
              })
            : null,
        ],
      );
    }),
  );
}

function hint({ count, alreadyAnnounced, blocked, isLast }) {
  if (isLast && blocked !== null) {
    return note(
      `Die ${blocked} ist gesperrt – damit würde die Runde aufgehen.`,
      "error",
    );
  }
  if (isLast) {
    return note(
      `Bereits ${alreadyAnnounced} von ${count} Stichen angesagt – überreizt, also ist nichts gesperrt.`,
    );
  }
  return note(`Noch ${count - alreadyAnnounced} von ${count} Stichen unangesagt.`);
}
