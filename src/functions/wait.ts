/**
 * Wait for the specified amount of time before resolving.
 * @param ms The amount of time to wait, in milliseconds.
 * @return A promise that resolves after the specified amount of time.
 */
function wait(ms: number): Promise<void>
{
	return new Promise((resolve) => setTimeout(resolve, ms));
};

export default wait;
