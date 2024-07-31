import { readFile, unlink, writeFile } from "fs/promises";

import type { Undefinable } from "../../types";

type StoreOptions = {
	BasePath: string;
};

const DEFAULT_STORE_OPTIONS = {
	BasePath: "./tmp/"
};

class SimpleStore
{
	#BasePath: string;

	constructor(options: Undefinable<StoreOptions>)
	{
		options = { ...DEFAULT_STORE_OPTIONS, ...options };

		this.#BasePath = options.BasePath;
		if (!this.#BasePath.endsWith("/"))
			this.#BasePath += "/";
	}

	async Get(key: string | Buffer)
	{
		const path = this.#BasePath + key;
		return await readFile(path);
	}

	async Set(key: string | Buffer, value: string | Buffer)
	{
		const path = this.#BasePath + key;
		await writeFile(path, value);
	}

	async Remove(key: string | Buffer)
	{
		const path = this.#BasePath + key;
		await unlink(path);
	}
}

export default SimpleStore;
