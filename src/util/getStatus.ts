import fetch from "./fetch.js";

import type { operations } from "../SpaceTradersApi";

async function getStatus(): Promise<operations["get-status"]["responses"][200]["content"]["application/json"]>
{
	const { data, error } = await fetch.GET("/");
	if (error)
		throw new Error(error);

	return data;
}

export default getStatus;
