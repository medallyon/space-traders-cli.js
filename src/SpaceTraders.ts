// Missing file SpaceTradersApi? Run `npm run generate-types` to generate it.
import type { components, operations } from "./SpaceTradersApi";

import Ratelimits from "./middleware/Ratelimits.js";
import fetch from "./util/fetch.js";

const DEFAULT_REGISTER_OPTIONS = {
	faction: "COSMIC",
	symbol: "",
	email: "",
};

fetch.use(Ratelimits);

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

type RegisterData = operations["register"]["responses"]["201"]["content"]["application/json"]["data"] | undefined;

class SpaceTraders
{
	private Token: string;

	constructor(token: string, registerData: RegisterData)
	{
		if (typeof token !== "string")
			throw new Error("No token provided.");

		this.Token = token;
	}
}

export default SpaceTraders;
