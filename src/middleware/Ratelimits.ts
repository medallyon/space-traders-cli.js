import type { Middleware } from "openapi-fetch";
import { RatelimitProperty } from "../../types.js";

import wait from "../functions/wait.js";

/*
	The SpaceTraders API is subject to rate limits. The following is a list that outlines the rate limits that are currently in place:

	Type	Status	Limit	Burst Limit	Burst Duration
	IP Address	429	2 requests per second	30 requests	60 seconds
	Account	429	2 requests per second	30 requests	60 seconds
	DDoS Protection	502	-	-	-
*/

/*
	The SpaceTraders API will return the following headers in a 429 response to indicate the current rate limit status.

	Header Name	Description
	x-ratelimit-type	The type of rate limit that was exceeded.
	x-ratelimit-limit	The maximum number of requests that can be made in a given time period.
	x-ratelimit-remaining	The number of requests remaining in the current time period.
	x-ratelimit-reset	The time at which the current time period will reset.
	x-ratelimit-limit-burst	The maximum number of requests that can be made in a given burst duration.
	x-ratelimit-limit-per-second	The maximum number of requests that can be made in a given time period.
*/

/*
	The following is an example of a response when the rate limit has been exceeded:

	HTTP/1.1 429 Too Many Requests
	Date: Tue, 21 Jan 2023 23:36:32 GMT
	access-control-allow-origin: \*
	access-control-expose-headers: Retry-After, X-RateLimit-Type, X-RateLimit-Limit-Burst, X-RateLimit-Limit-Per-Second, X-RateLimit-Remaining, X-RateLimit-Reset
	content-type: application/json; charset=utf-8
	retry-after: 1
	x-powered-by: Express
	x-ratelimit-limit-burst: 10
	x-ratelimit-limit-per-second: 2
	x-ratelimit-remaining: 0
	x-ratelimit-reset: 2023-01-21T23:36:33.435Z
	x-ratelimit-type: IP Address

	{
		"error": {
			"message": "You have reached your API limit.",
			"code": 429,
			"data": {
				"type": "IP Address",
				"retryAfter": 1,
				"limitBurst": 10,
				"limitPerSecond": 2,
				"remaining": 0,
				"reset": "2023-01-21T23:36:33.435Z"
			}
		}
	}
*/

async function retryWithExponentialDelay(func: () => any, maxRetries: number = -1, baseDelay: number = 1000): Promise<void>
{
	let retries = 0;

	const retry = async () =>
	{
		try
		{
			await func();
		}

		catch (error)
		{
			if (maxRetries === -1 || retries < maxRetries)
			{
				// Exponential backoff
				const delay = baseDelay * Math.pow(2, retries);
				retries++;

				console.log(`Retry #${retries} in ${delay}ms...`);

				await wait(delay);
				await retry();
			}

			else
				throw error;
		}
	};

	await retry();
}

const Ratelimits: Middleware = {
	async onResponse({ request, response })
	{
		const ratelimitType = response.headers.get(RatelimitProperty.Type);
		if (!ratelimitType)
			return response;

		const ratelimitRemaining = Number(response.headers.get(RatelimitProperty.Remaining));
		if (ratelimitRemaining > 0)
			return response;

		const ratelimitReset = String(response.headers.get(RatelimitProperty.Reset));
		const ratelimitResetDate = new Date(ratelimitReset);
		const now = new Date();

		const timeToWait = ratelimitResetDate.getTime() - now.getTime();
		const jitter = Math.random() * 1000;

		// Wait until the rate limit resets
		await wait(timeToWait + jitter);

		// Retry the request
		try
		{
			const { ...requestOptions } = request;
			const retryResponse = await retryWithExponentialDelay(() => fetch(request.url, requestOptions), 5);
			return retryResponse;
		}

		catch (error)
		{
			console.error(error);
			throw error;
		}
	}
};

export default Ratelimits;
