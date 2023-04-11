import * as t from "io-ts";

import { Common } from "./common";
import { IntegerSchema } from "../types";

const IntegerType = t.type({
	type: t.literal("integer"),
});

const IntegerOverrides = t.partial({
	const: t.Integer,
	enum: t.array(t.Integer),
	default: t.Integer,
	examples: t.array(t.Integer),
});

const IntegerSpecificFields = t.partial({
	multipleOf: t.Integer,
	maximum: t.Integer,
	exclusiveMaximum: t.Integer,
	minimum: t.Integer,
	exclusiveMinimum: t.Integer,
});

const IntegerSchema: t.Type<IntegerSchema> = t.recursion("IntegerSchema", () =>
	t.intersection([
		IntegerType,
		IntegerOverrides,
		IntegerSpecificFields,
		Common,
	]),
);

export { IntegerSchema };
