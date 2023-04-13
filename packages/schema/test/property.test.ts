import { describe, test, expect } from "vitest";

import {
	property,
	refSchema,
	propertyRec,
	schemaOrRefSchema,
} from "../src/options/property";

describe("property", () => {
	test("property", () => {
		const schema = { type: "object", properties: { foo: { type: "string" } } };
		// @ts-expect-error
		const result = property("foo")(schema);
		expect(result).toEqual({ _tag: "Some", value: { type: "string" } });
	});

	test("refSchema", () => {
		const fooSchema = {
			type: "object",
			properties: { foo: { type: "string" } },
		};
		const schema = {
			$ref: "#/definitions/foo",
			$defs: { "#/definitions/foo": fooSchema },
		};
		// @ts-expect-error
		const result = refSchema(schema)(schema);
		expect(result).toEqual({ _tag: "Some", value: fooSchema });
	});

	test("schemaOrRefSchema - schema", () => {
		const schema = {
			type: "object",
			properties: { foo: { type: "string" } },
			$defs: {
				"#/definitions/foo": { type: "string", $comment: "ignore me..." },
			},
		};
		// @ts-expect-error
		const result = schemaOrRefSchema(schema)(schema);
		expect(result).toEqual(schema);
	});

	test("schemaOrRefSchema - refSchema", () => {
		const fooSchema = {
			type: "object",
			properties: { foo: { type: "string" } },
		};
		const schema = {
			$ref: "#/definitions/foo",
			$defs: { "#/definitions/foo": fooSchema },
		};
		// @ts-expect-error
		const result = schemaOrRefSchema(schema)(schema);
		expect(result).toEqual(fooSchema);
	});

	test("propertyRec", () => {
		const schema = {
			type: "object",
			properties: { foo: { $ref: "#/definitions/foo" } },
			$defs: {
				"#/definitions/foo": {
					type: "object",
					properties: { bar: { type: "string" } },
				},
			},
		};

		// @ts-expect-error
		const result = propertyRec(["foo", "bar"])(schema);
		expect(result).toEqual({ _tag: "Some", value: { type: "string" } });
	});
});
