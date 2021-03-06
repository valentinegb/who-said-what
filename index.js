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

			const originalActionHandler =
				mod._orderedActionHandlers.MESSAGE_DELETE[index].actionHandler;
			const originalstoreDidChange =
				mod._orderedActionHandlers.MESSAGE_DELETE[index].storeDidChange;

			mod._orderedActionHandlers.MESSAGE_DELETE[index] = {
				actionHandler: (obj) => {
					if (
						document
							.getElementById(`chat-messages-${obj.id}`)
							?.className.includes("ephemeral")
					)
						return originalActionHandler(obj);

					if (deleted.find((x) => x.id === obj.id)) return;

					deleted.push(obj);

					styleMessage(obj);
				},

				storeDidChange: (obj) => {
					if (
						document
							.getElementById(`chat-messages-${obj.id}`)
							?.className.includes("ephemeral")
					)
						return originalstoreDidChange(obj);
				},
			};
		};

		interval = setInterval(run, 300);

		setup();

		this.injectStyles("./styles.css");
	}

	stop() {
		clearInterval(interval);

		for (let e of document.getElementsByClassName("vz-deleted-message")) {
			e.remove();
		}

		mod._orderedActionHandlers.MESSAGE_DELETE[index] = original;
	}
}
