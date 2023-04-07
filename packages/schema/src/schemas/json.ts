import * as t from "io-ts";

import type { JsonSchema } from "../types";

import { ArraySchema } from "./array";
import { NumberSchema } from "./number";
import { IntegerSchema } from "./integer";
import { ObjectSchema } from "./object";
import { StringSchema } from "./string";
import { RefSchema } from "./ref";

const JsonSchema: t.Type<JsonSchema> = t.recursion("JsonSchema", () =>
	t.union([
		ArraySchema,
		NumberSchema,
		IntegerSchema,
		ObjectSchema,
		StringSchema,
		RefSchema,
	]),
);

export { JsonSchema };
