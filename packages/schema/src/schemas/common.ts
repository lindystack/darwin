import * as t from "io-ts";

import { JsonSchema } from "./json";
import { References } from "../types";

// @internal
const Primitive = t.partial({
	type: t.string,
	const: t.unknown,
	enum: t.array(t.unknown),
	format: t.string,
});

// @internal
const Meta = t.partial({
	$schema: t.string,
	$vocabulary: t.record(t.string, t.boolean),
	$comment: t.string,
});

// @internal
const References: t.Type<References> = t.recursion("References", () =>
	t.partial({
		$id: t.string,
		$defs: t.record(t.string, JsonSchema),
		$anchor: t.string,
		$dynamicAnchor: t.string,
		$ref: t.string,
		$dynamicRef: t.string,
	}),
);

// @internal
const Annotations = t.partial({
	default: t.unknown,
	deprecated: t.boolean,
	readOnly: t.boolean,
	writeOnly: t.boolean,
	title: t.string,
	description: t.string,
	examples: t.array(t.unknown),
});

export const Common = t.intersection([
	Primitive,
	Meta,
	References,
	Annotations,
]);
