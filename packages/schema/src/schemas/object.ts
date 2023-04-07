import * as t from "io-ts";

import { JsonSchema } from "./json";
import { Common } from "./common";
import { ObjectSpecificFields } from "../types";

// @internal
const ObjectType = t.type({
	type: t.literal("object"),
});

// @internal
const ObjectOverrides = t.partial({
	const: t.UnknownRecord,
	enum: t.array(t.UnknownRecord),
	default: t.UnknownRecord,
	examples: t.array(t.UnknownRecord),
});

// @internal
const ObjectSpecificFields: t.Type<ObjectSpecificFields> = t.recursion(
	"ObjectSpecificFields",
	() =>
		t.partial({
			properties: t.record(t.string, JsonSchema),
			patternProperties: t.record(t.string, JsonSchema),
			additionalProperties: JsonSchema,
			propertyNames: JsonSchema,
			unevaluatedProperties: JsonSchema,
			maxProperties: t.number,
			minProperties: t.number,
			required: t.array(t.string),
			dependentRequired: t.record(t.string, t.array(t.string)),
			dependentSchemas: t.record(t.string, JsonSchema),
		}),
);

const ObjectSchema = t.intersection([
	ObjectType,
	ObjectOverrides,
	ObjectSpecificFields,
	Common,
]);

type ObjectSchema = t.TypeOf<typeof ObjectSchema>;

export { ObjectSchema };
