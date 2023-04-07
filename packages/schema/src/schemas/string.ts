import * as t from "io-ts";

import { Common } from "./common";
import { JsonSchema } from "./json";
import { StringSpecificFields } from "../types";

const StringType = t.type({
	type: t.literal("string"),
});

const StringOverrides = t.partial({
	const: t.string,
	enum: t.array(t.string),
	default: t.string,
	examples: t.array(t.string),
});

const StringSpecificFields: t.Type<StringSpecificFields> = t.recursion(
	"StringSpecificFields",
	() =>
		t.partial({
			maxLength: t.number,
			minLength: t.number,
			pattern: t.string,
			contentEncoding: t.string,
			contentMediaType: t.string,
			contentSchema: JsonSchema,
		}),
);

const StringSchema = t.intersection([
	StringType,
	StringOverrides,
	StringSpecificFields,
	Common,
]);

type StringSchema = t.TypeOf<typeof StringSchema>;

export { StringSchema };
