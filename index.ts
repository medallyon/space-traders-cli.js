import { search } from "@inquirer/prompts";

// '.js' extension is required on Node because it doesn't allow extension-less imports
import { IActionModule, Nullable } from "./types.js";

import { inferClosestActions } from "./src/functions/inferClosestAction.js";
import getModules from "./src/util/getModules.js";
import { oraPromise as ora } from "ora";

const RANDOM_DEFAULT_ACTION_PROMPTS = [
	"Get server status?",
	"When is the next server reset?",
	"Register for a new account?",
	"Get agent details?",
	"List my ships?",
	"Generate a new contract?",
	"Exit?"
];

let inputPromptPromise: Nullable<Promise<string> & { cancel: () => void; }>;
let exited = false;
let modules: { [actionName: string]: IActionModule; } = {};

function exit()
{
	if (inputPromptPromise)
		inputPromptPromise.cancel();

	console.log("\nFarewell, Sailor!");
	exited = true;
}

async function init()
{
	modules = await getModules();
}

function getClient()
{
	return null;
}

async function main()
{
	inputPromptPromise = search<string>({
		message: "(e.g. " + RANDOM_DEFAULT_ACTION_PROMPTS[Math.floor(Math.random() * RANDOM_DEFAULT_ACTION_PROMPTS.length)] + ") >",
		// default: "e.g. " + RANDOM_DEFAULT_ACTION_PROMPTS[Math.floor(Math.random() * RANDOM_DEFAULT_ACTION_PROMPTS.length)],
		// required: true,
		source: async (term) =>
		{
			if (!term)
				return RANDOM_DEFAULT_ACTION_PROMPTS.map(prompt => ({ value: prompt, name: prompt }));

			const closestActions = inferClosestActions(term, 7);
			const actions = closestActions.map(action => ({
				name: `${(action.matchingDisplayName || action.action)}`,
				value: action.action,
				description: action.module.Description
			}));

			return actions;
		},
	}, {
		clearPromptOnDone: true,
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

	try
	{
		await ora(actionModule.Run(getClient()), {
			text: "Running action..."
		});
	}
	catch (error: Error | any)
	{
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
