// The code of this plugin is heavily influenced by Ducko's "Better Message Deletion" module for GooseMod, I am far too dum to do make this myself.

import { Plugin } from "@vizality/entities";
import { getModule } from "@vizality/webpack";

const mod = getModule((module) => module["register"] !== undefined);
let interval;
let index = 0;
let original;
let style;

export default class WhoSaidWhat extends Plugin {
  start() {
    let deleted = [];

    const styleMessage = async ({ id }) => {
      let el = document.getElementById(`chat-messages-${id}`);
      if (!el) return;

      if (el.classList.contains("vz-deleted-message")) return;

      el.classList.add("vz-deleted-message");
    };

    const run = () => {
      for (let obj of deleted) {
        styleMessage(obj);
      }
    };

    const getWantedHandler = (mod) =>
      mod._orderedActionHandlers.MESSAGE_DELETE.find((x) =>
        x.actionHandler.toString().includes("revealedMessageId")
      );

    const setup = () => {
      try {
        original = getWantedHandler(mod);
      } catch (e) {
        return setTimeout(setup, 3000);
      }

      index = mod._orderedActionHandlers.MESSAGE_DELETE.indexOf(
        getWantedHandler(mod)
      );

      mod._orderedActionHandlers.MESSAGE_DELETE[index] = {
        actionHandler: (obj) => {
          if (deleted.find((x) => x.id === obj.id)) {
            return;
          }

          deleted.push(obj);

          styleMessage(obj);
        },

        storeDidChange: function () {},
      };
    };

    interval = setInterval(run, 300);

    setup();

    style = document.createElement("style");
    style.textContent = `.vz-deleted-message {
      background-color: rgba(240, 71, 71, 0.1) !important;
    }`;
    document.head.append(style);
  }

  stop() {
    clearInterval(interval);

    for (let e of document.getElementsByClassName("vz-deleted-message")) {
      e.remove();
    }

    try {
      style.remove();
    } catch {}

    mod._orderedActionHandlers.MESSAGE_DELETE[index] = original;
  }
}
