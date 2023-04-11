import { JsonSchema } from "../schemas";
import {
	Option,
	fromNullable,
	map as mapOption,
	toUndefined,
} from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import { propRec, maybeType } from "../internals/options";

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

/**
 * resolveProperty :: string -> JsonSchema -> Option<JsonSchema>
 * @since 0.0.3
 */
export const resolveProperty = (
	key: string,
	rootSchema: JsonSchema,
): JsonSchema | undefined => toUndefined(propRec(key, rootSchema));

export const resolveType = (
	key: string,
	rootSchema: JsonSchema,
): string | undefined => {
	const prop = resolveProperty(key, rootSchema);
	if (prop) {
		return toUndefined(maybeType(prop));
	}
};
