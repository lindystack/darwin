import { describe, test, expect } from "vitest";

import {
	refId,
	def,
	refDef,
	refDefExtended,
	refDefRec,
} from "../src/internals/options";

describe("options", () => {
	test("ref", () => {
		const result = refId({ $ref: "schemas/test" });
		expect(result).toStrictEqual({ _tag: "Some", value: "schemas/test" });
	});
	test("ref (array)", () => {
		const result = refId({ type: "array", items: { $ref: "schemas/test" } });
		expect(result).toStrictEqual({ _tag: "Some", value: "schemas/test" });
	});
	test("def", () => {
		// @ts-expect-error
		const result = def("schemas/test")({
			$defs: { "schemas/test": { type: "string" } },
		});
		expect(result).toStrictEqual({
			_tag: "Some",
			value: { type: "string" },
		});
	});
	test("refDef", () => {
		// @ts-expect-error
		const result = refDef({ $ref: "schemas/test" })({
			$defs: { "schemas/test": { type: "string" } },
		});
		expect(result).toStrictEqual({ _tag: "Some", value: { type: "string" } });
	});
	test("refDefExtended", () => {
		// @ts-expect-error
		const result = refDefExtended({ $ref: "schemas/test" })({
			$defs: { "schemas/test": { type: "string" } },
		});
		expect(result).toStrictEqual({ _tag: "Some", value: { type: "string" } });
	});
	test("refDefExtended - with format", () => {
		const result = refDefExtended({
			format: "foo",
			type: "object",
			properties: { foo: { $ref: "schemas/test" } },
			// @ts-expect-error
		})({
			$defs: { "schemas/test": { type: "string" } },
		});
		expect(result).toStrictEqual({ _tag: "Some", value: { type: "string" } });
	});
	test("refDefRec", () => {
		const result = refDefRec({
			$ref: "schemas/test",
			// @ts-expect-error
		})({
			$defs: { "schemas/test": { type: "string" } },
		});
		expect(result).toStrictEqual({ _tag: "Some", value: { type: "string" } });
	});
	test("refDefRec", () => {
		const result = refDefRec({
			$ref: "schemas/foo",
			// @ts-expect-error
		})({
			$defs: {
				"schemas/foo": {
					type: "object",
					format: "bar",
					properties: { bar: { $ref: "schemas/bar" } },
				},
				"schemas/bar": { type: "string", $comment: "bar" },
			},
		});
		expect(result).toStrictEqual({
			_tag: "Some",
			value: { type: "string", $comment: "bar" },
		});
	});
});
