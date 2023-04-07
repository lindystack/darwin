import { test, expect, assert } from "vitest";

import { resolveRef } from "../src/helpers/resolvers";

// rome-ignore lint/suspicious/noExplicitAny: testing
export const flipEntitySchema: any = {
	$defs: {
		"/schemas/core/users": {
			title: "User",
			type: "object",
		},
	},
};

test("test", () => {
	const result = resolveRef(flipEntitySchema, "/schemas/core/users");

	// @ts-expect-error
	expect(result.value).toEqual({ type: "object", title: "User" });
});
