/* Die Ansagen werden reihum eingetragen - links vom Geber beginnend, der
   Geber zuletzt. Wer zuletzt dran ist, bekommt die Zahl gesperrt, mit der
   die Runde aufgehen würde. */

import { buzz, el } from "../dom.js";
import { resume } from "../flow.js";
import { bidOrder, cards, currentBids, submitBids, toBoard } from "../game.js";
import { forbiddenBid } from "../rules.js";
import { refresh } from "../router.js";
import { getGame, update } from "../store.js";
import { note, numberGrid } from "../ui/widgets.js";

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
      orderStrip(game, order, session.step),
      el("div", { class: "turn" }, [
        el("p", { class: "turn__label", text: "Wie viele Stiche holt" }),
        el("p", { class: "turn__name", text: game.players[seat] }),
      ]),
      numberGrid({
        max: count,
        value: session.values[seat],
        blocked,
        onPick: (value) => pick(value, seat, isLast),
      }),
      hint({ count, alreadyAnnounced, blocked, isLast }),
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

/** Wer ist schon durch, wer ist dran, wer kommt noch? */
function orderStrip(game, order, step) {
  return el(
    "ol",
    { class: "bidstrip" },
    order.map((seat, position) => {
      const done = position < step;
      const current = position === step;

      return el(
        "li",
        {
          class: `bidstrip__item${current ? " is-current" : ""}${done ? " is-done" : ""}`,
        },
        [
          el("span", { class: "bidstrip__name", text: game.players[seat] }),
          el("span", {
            class: "bidstrip__value",
            text: done ? String(session.values[seat]) : current ? "?" : "·",
          }),
          done
            ? el("button", {
                class: "bidstrip__edit",
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
      `${blocked} ist gesperrt: Die Ansagen dürfen nicht aufgehen. Bisher sind ${alreadyAnnounced} von ${count} Stichen angesagt.`,
      "error",
    );
  }
  if (isLast) {
    return note(
      `Bisher sind ${alreadyAnnounced} von ${count} Stichen angesagt – es ist bereits überreizt, also ist nichts gesperrt.`,
    );
  }
  return note(`Bisher angesagt: ${alreadyAnnounced} von ${count} Stichen.`);
}
