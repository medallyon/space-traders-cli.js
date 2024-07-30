import type { IActionModule } from "../../../types.js";

import getStatus from "../../util/getStatus.js";

// 14 days in milliseconds
const GAME_SERVER_DURATION = 14 * 24 * 60 * 60 * 1000;

const NextServerReset: IActionModule = {
	Static: true,
	Description: "Get the date of the next server reset.",

	Run: async function ()
	{
		const data = await getStatus();
		const previousResetDate = new Date(data?.resetDate);
		const nextResetDate = new Date(previousResetDate.getTime() + GAME_SERVER_DURATION);
		const daysFromNow = Math.floor((nextResetDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));

		return `The next server reset date is scheduled for: ${nextResetDate.toLocaleString()}. That's in ${daysFromNow} days.`;
	}
};

export default NextServerReset;
