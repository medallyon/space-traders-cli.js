import { Action, Nullable, Undefinable } from "../../types.js";

const ACTIONS = Object.values(Action);

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
 * Check if there is at least one instance of 4 consecutive characters from string1 in string2.
 * 
 * @param string1 The first string (original input).
 * @param string2 The second string (action name).
 * @param characters The number of characters to check for. If this is a decimal, it will be treated as a percentage of the length of string2. Defaults to 4.
 * 
 * @returns true if there is at least one instance of 'characters' consecutive characters, false otherwise.
 */
function hasConsecutiveCharacters(string1: string, string2: string, characters: Undefinable<number> = 4): boolean
{
	let threshold = characters;
	if (threshold < 1)
	{
		// If characters is a decimal, treat it as a percentage
		threshold = Math.ceil(string2.length * threshold);
	}

	let count = 0;
	let i = 0;
	let j = 0;

	while (i < string1.length && j < string2.length)
	{
		if (string1[i] === string2[j])
		{
			count++;
			i++;
			j++;
			if (count >= threshold)
				return true;
		}

		else
		{
			i = i - count + 1; // Move back i to the character after the first of the current sequence
			j = 0; // Restart j
			count = 0; // Reset count
		}
	}

	return false;
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
export default function inferClosestAction(input: string): Nullable<Action>
{
	const normalizeInput = input.toUpperCase().replace(/\s+/g, '');
	let highestScore = 0;
	let closestAction = null;

	for (const action of ACTIONS)
	{
		const normalizedAction = action.toUpperCase();
		const [lcsLength, firstMatchIndex] = calculateLCS(normalizeInput, normalizedAction);

		// Adjust score based on first match position
		const score = (lcsLength / normalizedAction.length) * (1 - firstMatchIndex / normalizedAction.length);
		if (score > highestScore)
		{
			highestScore = score;
			closestAction = action;
		}
	}

	// Check for at least one instance of 4 consecutive characters
	if (closestAction)
	{
		const normalizedAction = closestAction.toUpperCase();
		if (hasConsecutiveCharacters(normalizeInput, normalizedAction, normalizedAction.length <= 4 ? 4 : normalizedAction.length * 0.75))
			return closestAction;
	}

	return null;
}
