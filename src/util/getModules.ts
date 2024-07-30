import type { Dirent } from "fs";
import type { IActionModule } from "../../types";

import { readdir } from "fs/promises";
import { pathToFileURL } from "url";

const ACTIONS_PATH = `${process.cwd()}/src/actions`;

let modules: { [actionName: string]: IActionModule; };

async function getModules()
{
	if (modules)
		return modules;
	modules = {};

	async function processItem(item: Dirent, parentPath: string = "")
	{
		const fullPath = `${parentPath}/${item.name}`;
		if (item.isDirectory())
		{
			const contents = await readdir(fullPath, { withFileTypes: true });
			for (const content of contents)
				await processItem(content, fullPath);
		}

		else
		{
			const [fileName] = item.name.split('.');
			if (!fileName)
				return;

			// replace '.ts' with '.js' and use the file:// protocol to allow Node to import the file
			const fullPath = pathToFileURL(`${parentPath}/${fileName}.js`).href;

			const actionModule = await import(fullPath);
			modules[fileName] = actionModule.default;
		}
	}

	const moduleEntries = await readdir(ACTIONS_PATH, { withFileTypes: true });
	for (const module of moduleEntries)
		await processItem(module, ACTIONS_PATH);

	return modules;
}

export default getModules;
