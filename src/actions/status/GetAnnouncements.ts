import bold from "chalk";

import type { IActionModule } from "../../../types";

import getStatus from "../../util/getStatus.js";

const GetAnnouncements: IActionModule = {
	Static: true,
	Description: "A description of what this action achieves.",

	Run: async function (): Promise<string>
	{
		const data = await getStatus();
		const announcements = data.announcements;
		const announcementsString = announcements.map(({ title, body }, index) => `${index + 1}. ${bold(title)}\n${body}\n`).join("\n");

		return announcementsString;
	}
};

export default GetAnnouncements;
