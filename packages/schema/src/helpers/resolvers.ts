import { JsonSchema } from "../schemas";
import { Option, fromNullable, map as mapOption } from "fp-ts/Option";
import { pipe } from "fp-ts/function";

// This function takes a schema and a $ref, and returns the resolved schema as an Option
export const resolveRef = (
	schema: JsonSchema,
	ref: string,
): Option<JsonSchema> => {
	return pipe(
		fromNullable(schema.$defs),
		mapOption((defs) => defs[ref]),
	);
};
