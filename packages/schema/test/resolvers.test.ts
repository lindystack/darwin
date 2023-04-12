import { test, expect, describe, it } from "vitest";

import { resolveRef, resolveProperty } from "../src/helpers/resolvers";
import { JsonSchema } from "../src/schemas";

// rome-ignore lint/suspicious/noExplicitAny: testing
export const flipEntitySchema: any = {
	$defs: {
		"/schemas/core/users": {
			title: "User",
			type: "object",
		},
	},
};
describe("resolveRef", () => {
	test("resolveRef", () => {
		const result = resolveRef(flipEntitySchema, "/schemas/core/users");

		// @ts-expect-error
		expect(result.value).toEqual({ type: "object", title: "User" });
	});
});

describe("resolveProperty", () => {
	const schema: JsonSchema = {
		type: "object",
		properties: {
			foo: {
				type: "object",
				properties: {
					bar: { type: "string", $comment: "bar" },
				},
			},
			qux: { $ref: "schemas/qux" },
			quux: { $ref: "schemas/quux" },
		},
		$defs: {
			"schemas/qux": {
				type: "string",
				$comment: "qux",
			},
			"schemas/quux": {
				type: "object",
				format: "corge",
				properties: {
					corge: { $ref: "schemas/grault" },
				},
			},
			"schemas/grault": {
				type: "string",
				$comment: "grault",
			},
		},
	};

	test("a valid key and root schema", () => {
		const result = resolveProperty("foo.bar", schema);

		expect(result).toEqual({ type: "string", $comment: "bar" });
	});

	test("a nested key with $ref", () => {
		it("returns the resolved schema", () => {
			const result = resolveProperty("foo.qux", schema);

			expect(result).toEqual({ type: "string", $comment: "qux" });
		});
	});

	test("an invalid key", () => {
		it("returns None", () => {
			const result = resolveProperty("baz", schema);

			expect(result).toBeUndefined();
		});
	});

	test("a key that resolves to nested object", () => {
		it("returns the resolved schema", () => {
			const result = resolveProperty("foo", schema);

			expect(result).toEqual({
				type: "object",
				properties: { bar: { type: "string" } },
			});
		});
	});

	test("a key that resolves to a $ref", () => {
		it("returns the resolved schema", () => {
			const result = resolveProperty("qux", schema);

			expect(result).toEqual({
				type: "string",
				$comment: "qux",
			});
		});
	});

	test("a key that resolves to a nested $ref", () => {
		it("returns the resolved schema", () => {
			const result = resolveProperty("quux", schema);

			expect(result).toEqual({
				type: "string",
				$comment: "grault",
			});
		});
	});
});
