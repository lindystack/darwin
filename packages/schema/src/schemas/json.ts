import * as t from "io-ts";

import type { JsonSchema } from "../types";

import { ArraySchema } from "./array";
import { NumberSchema } from "./number";
import { IntegerSchema } from "./integer";
import { ObjectSchema } from "./object";
import { StringSchema } from "./string";

const JsonSchema: t.Type<JsonSchema> = t.recursion("JsonSchema", () =>
	t.union([
		ArraySchema,
		NumberSchema,
		IntegerSchema,
		ObjectSchema,
		StringSchema,
	]),
);

export { JsonSchema };
