import { search } from "@inquirer/prompts";
import ora from "ora";

import type { IActionModule, Nullable } from "./types";

// '.js' extension is required on Node because it doesn't allow extension-less imports
import { inferClosestActions } from "./src/functions/inferClosestAction.js";
import getModules from "./src/util/getModules.js";
import wait from "./src/functions/wait.js";

const RANDOM_DEFAULT_ACTION_PROMPTS = [
	{ name: "Get server status?", value: "GetStatus" },
	{ name: "When is the next server reset?", value: "NextServerReset" },
	{ name: "Register for a new account?", value: "Register" },
	{ name: "Get agent details?", value: "GetAgent" },
	{ name: "List my ships?", value: "ListShips" },
	{ name: "Generate a new contract?", value: "GenerateContract" },
	{ name: "Exit?", value: "Exit" }
];

let exited = false;
let inputPromptPromise: Nullable<Promise<string> & { cancel: () => void; }>;
let currentAction: Nullable<{ Module: IActionModule; Promise: Promise<any>; }>;
let modules: { [actionName: string]: IActionModule; } = {};

function exit()
{
	exited = true;

	if (inputPromptPromise)
		inputPromptPromise.cancel();

	console.log("Farewell, Sailor!");

	process.exit(0);
}

async function init()
{
	modules = await getModules();

	process.on("SIGINT", async function ()
	{
		// FIXME: Never seen this log, so not sure that it works
		console.log("Received SIGINT!!");

		// Cancel and clean up the current action
		if (currentAction)
		{
			const { Module: module, Promise: actionPromise } = currentAction;
			await Promise.race([actionPromise, new Promise(resolve => wait(0).then(resolve))]);
			if (typeof module.Cleanup === "function")
				await module.Cleanup();
		}

		else
			exit();
	});
}

function getClient()
{
	return null;
}

async function main()
{
	inputPromptPromise = search<string>({
		message: "(e.g. " + RANDOM_DEFAULT_ACTION_PROMPTS[Math.floor(Math.random() * RANDOM_DEFAULT_ACTION_PROMPTS.length)]?.name + ") >",
		source: async (term) =>
		{
			if (!term)
				return RANDOM_DEFAULT_ACTION_PROMPTS;

			const closestActions = inferClosestActions(term, 7);
			const actions = closestActions.map(action => ({
				name: `${(action.matchingDisplayName || action.action)}`,
				value: action.action,
				description: action.module.Description
			}));

			return actions;
		},
	});

	let actionInput: string;
	try
	{
		actionInput = await inputPromptPromise;
		inputPromptPromise = null;
	}
	catch (error: Error | any)
	{
		// Exit cleanly instead of throwing an error on Ctrl+C (SIGINT)
		if (error.constructor.name === "ExitPromptError")
		{
			exit();
			return;
		}

		console.error(error);
		return;
	}

	if (actionInput.toUpperCase() === "EXIT")
	{
		exit();
		return;
	}

	const actionModule = modules[actionInput];
	if (!actionModule)
	{
		console.error(`Action module not yet implemented: ${actionInput}\n`);
		return;
	}

	// if 'Static' is not defined, default to false
	const requiresClient = typeof actionModule.Static === "boolean" ? !actionModule.Static : false;
	const client = getClient();
	if (requiresClient && !client)
	{
		console.error("A SpaceTraders client has not yet been instantiated. Perhaps you need to register first?\n");
		return;
	}

	const spinner = ora("Running action...").start();

	try
	{
		currentAction = {
			Module: actionModule,
			Promise: actionModule.Run(client, spinner)
		};

		const actionResult = await currentAction.Promise;
		if (typeof actionModule.Cleanup === "function")
			await actionModule.Cleanup();

		currentAction = null;

		if (spinner)
			spinner.stop();

		if (typeof actionResult === "string")
			console.log(actionResult);

		if (spinner)
			spinner.succeed("Action completed successfully.");
	}
	catch (error: Error | any)
	{
		if (error.constructor.name === "ExitPromptError")
		{
			// FIXME: Breaks the CLI. No further output is shown after "Action Aborted".
			console.log();
			if (spinner)
				spinner.warn("Action aborted.\n");
			return;
		}

		if (spinner)
			spinner.fail("Action failed.");

		console.error(`Something went wrong while running the "${actionInput}" action. Here's the stack for the developer:`);
		console.error(error);
		console.error("\nPlease report this issue to the developer on GitHub: https://github.com/medallyon/space-traders-cli.js/issues");
	}

	console.log();
};

(async () =>
{
	await init();

	console.log("Welcome to your SpaceTraders Console. What actions do you want to take today?\n");

	while (!exited)
		await main();
})();
