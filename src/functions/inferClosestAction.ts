import bold from "chalk";

import type { IActionModule, Nullable, Undefinable } from "../../types.js";

import getModules from "../util/getModules.js";

let modules: { [actionName: string]: IActionModule; } = {};
let actionNames: string[] = [];
(async () =>
{
	modules = await getModules();
	actionNames = Object.keys(modules);
})();

/**
 * Calculate the longest common subsequence (LCS) between two strings.
 * 
 * @param string1 The first string to compare.
 * @param string2 The second string to compare.
 * 
 * @returns The length of the longest common subsequence and the index of the first match.
*/
function calculateLCS(string1: string, string2: string): [number, number]
{
	const lcsLengthTable = new Array(string1.length + 1).fill(null).map(() => Array(string2.length + 1).fill(0));

	// Initialize with the maximum possible index
	let firstMatchIndex = string2.length;
	for (let i = 1; i <= string1.length; i++)
	{
		for (let j = 1; j <= string2.length; j++)
		{
			if (string1[i - 1] === string2[j - 1])
			{
				lcsLengthTable[i][j] = lcsLengthTable[i - 1][j - 1] + 1;
				if (lcsLengthTable[i][j] === 1)
				{
					// If it's the start of a match
					firstMatchIndex = Math.min(firstMatchIndex, j - 1); // Update the first match index
				}
			}

			else
			{
				lcsLengthTable[i][j] = Math.max(lcsLengthTable[i - 1][j], lcsLengthTable[i][j - 1]);
			}
		}
	}

	return [lcsLengthTable[string1.length][string2.length], firstMatchIndex];
}

/**
 * Check for instances of consecutive characters from string1 in string2.
 * 
 * @param string1 The first string (original input).
 * @param string2 The second string (action name).
 * @param characters The number of characters to check for. If this is a decimal, it will be treated as a percentage of the length of string2. Defaults to 4.
 * 
 * @returns An array of serialized maps, with each entry being [indexOfConsecutiveCharactersStart, numberOfConsecutiveCharacters].
 */
function findConsecutiveCharacters(string1: string, string2: string, characters: Undefinable<number> = 4): Array<[number, number]>
{
	let threshold = characters;
	if (threshold < 1)
	{
		// If characters is a decimal, treat it as a percentage
		threshold = Math.ceil(string2.length * threshold);
	}

	const result: Array<[number, number]> = [];
	let count = 0;
	let i = 0;
	let j = 0;
	let startIndex = -1;

	while (i < string1.length && j < string2.length)
	{
		if (string1[i] === string2[j])
		{
			if (count === 0)
				startIndex = i;

			count++;
			i++;
			j++;

			if (count >= threshold)
			{
				result.push([startIndex, count]);
				count = 0; // Reset count after recording the sequence
				startIndex = -1; // Reset start index
			}
		}
		else
		{
			i = i - count + 1; // Move back i to the character after the first of the current sequence
			j = 0; // Restart j
			count = 0; // Reset count
			startIndex = -1; // Reset start index
		}
	}

	return result;
}

function hasConsecutiveCharacters(string1: string, string2: string, characters: Undefinable<number> = 4): boolean
{
	return findConsecutiveCharacters(string1, string2, characters).length > 0;
}

/**
 * Generate a chalk-ified string where matching characters are boldened.
 * 
 * @param input The input string.
 * @param action The action string.
 * 
 * @returns The chalk-ified string with matching characters boldened.
 */
function generateMatchingDisplayName(input: string, action: string): string
{
	const normalizedInput = input.toUpperCase();
	const normalizedAction = action.toUpperCase();
	let displayName = "";

	for (let i = 0; i < action.length; i++)
	{
		if (normalizedInput.includes(normalizedAction[i]))
			displayName += bold(action[i]);
		else
			displayName += action[i];
	}

	return displayName;
}

/**
 * Infer the closest actions from the input string.
 * The closest actions are determined by the longest common subsequence (LCS) between the input and the action.
 * The score is adjusted based on the first match position.
 * 
 * @param input The input string to infer the closest actions from.
 * @param limit The maximum number of actions to return. Defaults to 20.
 * 
 * @returns An array of the closest actions or an empty array if no actions are found.
*/
export function inferClosestActions(input: string, limit: number = 20): { action: string, matchingDisplayName: string, module: IActionModule; }[]
{
	const normalizedInput = input.toUpperCase().replace(/\s+/g, '');
	const actionScores: { action: string, score: number; }[] = [];

	for (const action of actionNames)
	{
		const normalizedAction = action.toUpperCase();
		const [lcsLength, firstMatchIndex] = calculateLCS(normalizedInput, normalizedAction);

		// Adjust score based on first match position
		let score = (lcsLength / normalizedAction.length) * (1 - firstMatchIndex / normalizedAction.length);

		// Add a significant weight for exact matches
		if (normalizedAction.includes(normalizedInput))
			score += 1.0;

		// Increase score weight per consecutive character
		const consecutiveCharacters = findConsecutiveCharacters(normalizedInput, normalizedAction, 4);
		for (const [_, count] of consecutiveCharacters)
			score += (count / normalizedAction.length) * 2;

		// Normalize the score by the length of the input string
		score /= normalizedInput.length;

		actionScores.push({ action, score });
	}

	// Sort actions by score in descending order
	actionScores.sort((a, b) => b.score - a.score);

	const mappedActions = actionScores
		.map(({ action, score }) => ({
			action, score,
			matchingDisplayName: generateMatchingDisplayName(normalizedInput, action),
			module: modules[action]
		})) as { action: string, matchingDisplayName: string, module: IActionModule; }[];

	return mappedActions.slice(0, limit);
}

/**
 * Infer the closest action from the input string.
 * The closest action is determined by the longest common subsequence (LCS) between the input and the action.
 * The score is adjusted based on the first match position.
 * 
 * @param input The input string to infer the closest action from.
 * 
 * @returns The closest action or null if no action is found (unlikely).
*/
export function inferClosestAction(input: string): Nullable<{ action: string, module: IActionModule; }>
{
	const normalizedInput = input.toUpperCase().replace(/\s+/g, '');
	let highestScore = 0;
	let closestAction: Nullable<{ action: string, module: IActionModule; }> = null;

	for (const action of actionNames)
	{
		const normalizedAction = action.toUpperCase();
		const [lcsLength, firstMatchIndex] = calculateLCS(normalizedInput, normalizedAction);

		// Adjust score based on first match position
		const score = (lcsLength / normalizedAction.length) * (1 - firstMatchIndex / normalizedAction.length);
		if (score > highestScore)
		{
			highestScore = score;
			closestAction = { action, module: modules[action] } as { action: string, module: IActionModule; };
			console.log(`Closest action: ${closestAction?.action} (${score})`);
		}
	}

	// Check for instances of at least 4 consecutive characters
	if (closestAction != null)
	{
		const normalizedAction = closestAction.action.toUpperCase();
		if (hasConsecutiveCharacters(normalizedInput, normalizedAction, normalizedAction.length <= 4 ? 4 : normalizedAction.length * 0.5))
			return closestAction;
	}

	return null;
}
