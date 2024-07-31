import type { Ora } from "ora";

export type Nullable<T> = T | null;

export type Undefinable<T> = T | undefined | void;

export enum RatelimitProperty
{
	Type = "x-ratelimit-type",
	Limit = "x-ratelimit-limit",
	Remaining = "x-ratelimit-remaining",
	Reset = "x-ratelimit-reset",
	LimitBurst = "x-ratelimit-limit-burst",
	LimitPerSecond = "x-ratelimit-limit-per-second",
}

export interface IActionModule
{
	// If true, this action can be run without a registered client.
	Static: Undefinable<boolean>;

	// A description of what this action does. Shown under the action in the search menu.
	Description: Undefinable<string>;

	Run: (client: Undefinable<SpaceTraders>, spinner: Undefinable<Ora>) => Promise<any>;
	Cleanup: Undefinable<() => Promise<void> | void>;
};
