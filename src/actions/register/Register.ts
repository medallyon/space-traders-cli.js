import { input, search } from "@inquirer/prompts";

import type { Ora } from "ora";
import type { IActionModule, Undefinable } from "../../../types";
import type { components } from "../../SpaceTradersApi";

import SpaceTraders from "../../classes/SpaceTraders.js";

import fetch from "../../util/fetch.js";
import store from "../../util/store.js";

type RegisterOptions = {
	faction: components["schemas"]["FactionSymbol"];
	/**
	 * @description Your desired agent symbol. This will be a unique name used to represent your agent, and will be the prefix for your ships.
	 * @example BADGER
	 */
	symbol: string;
	/** @description Your email address. This is used if you reserved your call sign between resets. */
	email?: string;
};

enum FactionSymbol
{
	COSMIC = "COSMIC",
	VOID = "VOID",
	GALACTIC = "GALACTIC",
	QUANTUM = "QUANTUM",
	DOMINION = "DOMINION",
	ASTRO = "ASTRO",
	CORSAIRS = "CORSAIRS",
	OBSIDIAN = "OBSIDIAN",
	AEGIS = "AEGIS",
	UNITED = "UNITED",
	SOLITARY = "SOLITARY",
	COBALT = "COBALT",
	OMEGA = "OMEGA",
	ECHO = "ECHO",
	LORDS = "LORDS",
	CULT = "CULT",
	ANCIENTS = "ANCIENTS",
	SHADOW = "SHADOW",
	ETHEREAL = "ETHEREAL"
}

const DEFAULT_REGISTER_OPTIONS = {
	faction: FactionSymbol.COSMIC,
	symbol: "",
	email: undefined,
};

const FACTIONS_LIST = Object.keys(FactionSymbol).map(faction => ({
	name: faction,
	value: faction,
}));

async function register(options: RegisterOptions)
{
	const body = structuredClone(DEFAULT_REGISTER_OPTIONS) as RegisterOptions;

	body.faction = options.faction;
	body.symbol = options.symbol;
	body.email = options.email;

	const { data, error } = await fetch.POST("/register", { body });
	if (error)
		throw new Error(error);

	await store.Set("./tmp/token", data.data.token);

	return new SpaceTraders(data.data.token, data.data);
}

class Register implements IActionModule
{
	Static = true;
	Description = "Register for a new account.";

	#SymbolPromise: Undefinable<Promise<string> & { cancel: () => void; }>;
	#FactionPromise: Undefinable<Promise<string> & { cancel: () => void; }>;
	#EmailPromise: Undefinable<Promise<string> & { cancel: () => void; }>;

	async Run(_: SpaceTraders, spinner: Undefinable<Ora>): Promise<string>
	{
		spinner?.stop();

		this.#SymbolPromise = input({
			message: "Enter your desired agent symbol:",
			required: true,

			validate: (input: string) =>
			{
				return input.length < 3 || input.length > 14 ? "Symbol must be between 3 and 14 characters." : true;
			}
		});
		const symbol = await this.#SymbolPromise;

		this.#FactionPromise = search({
			message: "Select a faction:",
			source: async (term) =>
			{
				if (!term)
					return FACTIONS_LIST;

				const closestFactions = FACTIONS_LIST.filter(faction => String(faction.name).toLowerCase().includes(term.toLowerCase()));
				return closestFactions;
			}
		});
		const faction = await this.#FactionPromise;

		this.#EmailPromise = input({
			message: "Enter your email address (Optional):",
			required: false,

			validate: (input: string) =>
			{
				if (!input)
					return true;

				const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				return !EMAIL_REGEX.test(input) ? "Invalid email address." : true;
			}
		});
		const email = await this.#EmailPromise;

		const options = {
			symbol,
			faction: faction as FactionSymbol,
			email
		};

		spinner?.start("Registering");

		const client = await register(options);
		return `Successfully registered as ${client.Agent?.symbol}!`;
	}

	async Cleanup()
	{
		this.#SymbolPromise?.cancel();
		this.#FactionPromise?.cancel();
		this.#EmailPromise?.cancel();
	}
};

export default new Register();
