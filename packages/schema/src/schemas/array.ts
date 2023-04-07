import * as t from "io-ts";

import { JsonSchema } from "./json";
import { ArraySchema, ArraySpecificFields } from "../types";

import { Common } from "./common";

// @internal
const ArrayType = t.type({
	type: t.literal("array"),
});

// @internal
const ArraySpecificFields: t.Type<ArraySpecificFields> = t.recursion(
	"ArraySpecificFields",
	() => {
		return t.partial({
			prefixItems: t.array(JsonSchema),
			items: JsonSchema,
			contains: JsonSchema,
			unevaluatedItems: JsonSchema,
			maxItems: t.number,
			minItems: t.number,
			uniqueItems: t.boolean,
			maxContains: t.number,
			minContains: t.number,
		});
	},
);

const ArraySchema: t.Type<ArraySchema> = t.recursion("ArraySchema", () => {
	return t.intersection([Common, ArrayType, ArraySpecificFields]);
});

export { ArraySchema };
