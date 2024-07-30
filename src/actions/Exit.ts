import { IActionModule } from "../../types.js";

const Exit: IActionModule = {
	Static: true,

	Description: "Exit the program.",

	Run: async function ()
	{
		console.log("Farewell, sailor!");
		process.exit();
	}
};

export default Exit;
