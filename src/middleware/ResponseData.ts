import { Middleware } from "openapi-fetch";

// most if not all responses wrap data in a data object. This middleware will unwrap the data object and return a new response.
const ResponseData: Middleware = {
	async onResponse({ response })
	{
		const data = await response.json();
		const { ...resOptions } = response;

		if (data.data)
			return new Response(JSON.stringify(data.data), { ...resOptions });

		return response;
	}
};

export default ResponseData;
