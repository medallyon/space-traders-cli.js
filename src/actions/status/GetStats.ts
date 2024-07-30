import type { IActionModule } from "../../../types";

import getStatus from "../../util/getStatus.js";

const GetStatus: IActionModule = {
	Static: true,
	Description: "Get the latest stats.",

	Run: async function (): Promise<string>
	{
		const data = await getStatus();
		const stats = data.stats;
		const stringStats = Object.entries(stats).map(([key, value]) => `${key}: ${value}`).join("\n");

		return stringStats;
	}
};

export default GetStatus;
