import type { IActionModule } from "../../../types";

import getStatus from "../../util/getStatus.js";

const GetStatus: IActionModule = {
	Static: true,
	Description: "Get the status of the SpaceTraders server.",

	Run: async function (): Promise<string>
	{
		const data = await getStatus();
		return data.status;
	}
};

export default GetStatus;
