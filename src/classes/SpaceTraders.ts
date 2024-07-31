import EventEmitter from "events";

// Missing file SpaceTradersApi? Run `npm run generate-types` to generate it.
import type { components, operations } from "../SpaceTradersApi";
import type { Undefinable } from "../../types";

type RegisterData = operations["register"]["responses"]["201"]["content"]["application/json"]["data"] | undefined;

import GetAgent from "../actions/agents/GetAgent.js";

const READY_SIGNAL = "READY";

class SpaceTraders
{
	Agent: Undefinable<components["schemas"]["Agent"]>;
	Contract: Undefinable<components["schemas"]["Contract"]>;
	Faction: Undefinable<components["schemas"]["Faction"]>;
	Ship: Undefinable<components["schemas"]["Ship"]>;

	IsReady = false;

	#OnReady = new EventEmitter();
	#Token: string;

	constructor(token: string, registerData: Undefinable<RegisterData>)
	{
		if (typeof token !== "string")
			throw new Error("No token provided.");

		this.#Token = token;

		if (!registerData)
		{
			this.Initialize();
			return;
		}

		this.Agent = registerData.agent;
		this.Contract = registerData.contract;
		this.Faction = registerData.faction;
		this.Ship = registerData.ship;

		this.IsReady = true;
		this.#OnReady.emit(READY_SIGNAL);
	}

	async OnReady(): Promise<void>
	{
		if (this.IsReady)
			return Promise.resolve();

		return new Promise(resolve => this.#OnReady.once(READY_SIGNAL, resolve));
	}

	async Initialize()
	{
	}
}

export default SpaceTraders;
