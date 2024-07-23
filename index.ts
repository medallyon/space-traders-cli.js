import * as fs from "node:fs/promises";
import { Dirent } from "node:fs";

import { input } from "@inquirer/prompts";

// '.js' extension is required on Node because it doesn't allow extension-less imports
import { Action, IActionModule } from "./types.js";

import inferClosestAction from "./src/functions/inferClosestAction.js";

const ACTIONS_DIRECTORY = "./src/actions";

const RANDOM_DEFAULT_ACTION_PROMPTS = [
	"Get server status?",
	"When is the next server reset?",
	"Register for a new account?",
	"Get agent details?",
	"List my ships?",
	"Generate a new contract?",
	"Exit?"
];

let exited = false;
let modules: { [actionName: string]: IActionModule; } = {};

async function init()
{
	async function processItem(item: Dirent, parentPath: string = '')
	{
		const fullPath = `${parentPath}/${item.name}`;
		if (item.isDirectory())
		{
			const contents = await fs.readdir(fullPath, { withFileTypes: true });
			for (const content of contents)
				await processItem(content, fullPath);
		}

		else
		{
			const [fileName] = item.name.split('.');
			if (!fileName)
				return;

			// replace '.ts' with '.js' to allow Node to import the file
			const fullPath = `${parentPath}/${fileName}.js`;

			const actionModule = await import(fullPath);
			modules[fileName] = actionModule.default;
		}
	}

	const actions = await fs.readdir(ACTIONS_DIRECTORY, { withFileTypes: true });
	for (const action of actions)
		await processItem(action, ACTIONS_DIRECTORY);
}

function getClient()
{
	return null;
}

async function main()
{
	const actionInput = await input({
		message: ">",
		default: "e.g. " + RANDOM_DEFAULT_ACTION_PROMPTS[Math.floor(Math.random() * RANDOM_DEFAULT_ACTION_PROMPTS.length)],
		required: true,
	});

	const closestAction = inferClosestAction(actionInput);
	if (closestAction == null)
	{
		console.error("No action found. Try to describe what you want to do more clearly.\n");
		return;
	}

	if (closestAction === Action.Exit)
	{
		console.log("Exiting...");
		exited = true;
		return;
	}

	const actionModule = modules[closestAction];
	if (!actionModule)
	{
		console.error(`Action module not yet implemented: ${closestAction}\n`);
		return;
	}

	// if RequiresClient is not defined, assume it requires a client
	const requiresClient = typeof actionModule.RequiresClient === "undefined" ? true : actionModule.RequiresClient;
	const client = getClient();
	if (requiresClient && !client)
	{
		console.error("A SpaceTraders client has not yet been instantiated. Perhaps you need to register first?\n");
		return;
	}

	await actionModule.Run(getClient());

	console.log();
};

(async () =>
{
	await init();

	console.log("Welcome to your SpaceTraders Console. What actions do you want to take today?\n");

	while (!exited)
		await main();
})();
