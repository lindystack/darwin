import * as t from "io-ts";

import { Common } from "./common";

const NumberType = t.type({
	type: t.literal("number"),
});

const NumberOverrides = t.partial({
	const: t.number,
	enum: t.array(t.number),
	default: t.number,
	examples: t.array(t.number),
});

const NumberSpecificFields = t.partial({
	multipleOf: t.number,
	maximum: t.number,
	exclusiveMaximum: t.number,
	minimum: t.number,
	exclusiveMinimum: t.number,
});

const NumberSchema = t.intersection([
	NumberType,
	NumberOverrides,
	NumberSpecificFields,
	Common,
]);

type NumberSchema = t.TypeOf<typeof NumberSchema>;

export { NumberSchema };
