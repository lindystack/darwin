import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";

import { JsonSchema } from "../schemas";
import { ObjectSchema } from "../schemas/object";
import { def } from "./def";
import { refId } from "./ref";

/**
 * @since 0.0.6
 */
const objectSchema = (schema: JsonSchema): O.Option<ObjectSchema> =>
	pipe(schema, ObjectSchema.decode, O.fromEither);

/**
 * maybeProperties :: JsonSchema -> Maybe { [key: string]: JsonSchema }
 * @since 0.0.3
 */
const properties = (
	schema: JsonSchema,
): O.Option<ObjectSchema["properties"]> => {
	return pipe(
		schema,
		objectSchema,
		O.chain((s) => O.fromNullable(s.properties)),
	);
};

/**
 * property :: String -> JsonSchema -> Maybe JsonSchema
 * @since 0.0.6
 */
export const property =
	(key: string) => (schema: JsonSchema): O.Option<JsonSchema> => {
		return pipe(
			properties(schema),
			O.chainNullableK((s) => s),
			O.chainNullableK((s) => s[key]),
		);
	};

/**
 * @since 0.0.3
 * @deprecated use `property` instead
 */
export const prop = property;

/**
 * The idea here is that if we are attempting to get a property from a schema,
 * and that schema is a ref, we should first resolve the ref, and then get the property.
 *
 * Should probably be used in conjuction with `property` so you get either one. But here we
 * are just trying to do one thing.
 *
 * refSchema :: JsonSchema -> JsonSchema -> Maybe JsonSchema
 * @since 0.0.6
 */
export const refSchema =
	(schema: JsonSchema) => (rootSchema: JsonSchema): O.Option<JsonSchema> => {
		return pipe(
			schema,
			refId,
			O.chain((id) => def(id)(rootSchema)),
		);
	};

/**
 * schemaOrRefSchema :: String -> JsonSchema -> JsonSchema
 * @since 0.0.6
 */
export const schemaOrRefSchema =
	(schema: JsonSchema) => (rootSchema: JsonSchema): JsonSchema => {
		return pipe(
			rootSchema,
			refSchema(schema),
			O.getOrElse(() => rootSchema),
		);
	};

/**
 * propertyRec :: String[] -> JsonSchema -> Maybe JsonSchema
 * @since 0.0.6
 */
export const propertyRec =
	(keys: string[]) => (schema: JsonSchema): O.Option<JsonSchema> => {
		const [key, ...rest] = keys;
		return pipe(
			schema,
			schemaOrRefSchema(schema),
			property(key),
			O.fold(
				() => O.none,
				(s) =>
					rest?.length
						? propertyRec(rest)({ ...s, $defs: schema.$defs })
						: O.some(s),
			),
		);
	};
