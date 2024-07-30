import type { IActionModule } from "../../../types.js";

import getStatus from "../../util/getStatus.js";

const LastServerReset: IActionModule = {
	Static: true,
	Description: "Get the last server reset date.",

	Run: async function ()
	{
		const data = await getStatus();
		const previousResetDate = new Date(data?.resetDate);
		const daysAgo = Math.floor((Date.now() - previousResetDate.getTime()) / (24 * 60 * 60 * 1000));

		return `The next server reset date is scheduled for: ${previousResetDate.toLocaleString()}. That was ${daysAgo} days ago.`;
	}
};

export default LastServerReset;
