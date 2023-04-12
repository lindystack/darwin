import {
	Option,
	alt,
	chain,
	chainNullableK,
	fold,
	fromEither,
	fromNullable,
	map,
	some,
	toNullable,
} from "fp-ts/Option";
import { flow, pipe } from "fp-ts/function";
import * as S from "fp-ts/string";
import { tailRec } from "fp-ts/lib/ChainRec";
import { left, right } from "fp-ts/lib/Either";

import { JsonSchema } from "../schemas";
import { ArraySchema } from "../schemas/array";
import { ObjectSchema } from "../schemas/object";
import { RefSchema } from "../schemas/ref";

/**
 * maybeDefs :: JsonSchema -> Maybe { [key: string]: JsonSchema }
 * @internal
 */
const maybeDefs = (schema: JsonSchema): Option<JsonSchema["$defs"]> =>
	fromNullable(schema.$defs);

/**
 * maybeArray :: JsonSchema -> Maybe ArraySchema
 * @internal
 */
const maybeArray = (schema: JsonSchema): Option<ArraySchema> =>
	pipe(schema, ArraySchema.decode, fromEither);

/**
 * maybeSimpleRef :: JsonSchema -> Maybe RefSchema
 * @internal
 */
const maybeSimpleRef = (schema: JsonSchema): Option<RefSchema> =>
	pipe(schema, RefSchema.decode, fromEither);

/**
 * maybeArrayRef :: JsonSchema -> Maybe RefSchema
 * @internal
 */
const maybeArrayRef = (schema: JsonSchema): Option<RefSchema> =>
	pipe(
		schema,
		maybeArray,
		chain((s) => fromNullable(s.items)),
		chain(maybeSimpleRef),
	);

/**
 *
 * maybeRef :: JsonSchema -> Maybe RefSchema
 * @internal
 */
const maybeRef = (schema: JsonSchema): Option<RefSchema> =>
	pipe(
		schema,
		maybeSimpleRef,
		alt(() => maybeArrayRef(schema)),
	);

/**
 * maybeFormat :: JsonSchema -> Maybe String
 * @internal
 */
const maybeFormat = (schema: JsonSchema): Option<string> =>
	pipe(
		schema,
		fromNullable,
		chainNullableK((s) => s.format),
	);

/**
 * maybeType :: JsonSchema -> Maybe String
 * @internal
 */
export const maybeType = (schema: JsonSchema): Option<string> =>
	pipe(
		schema,
		fromNullable,
		chainNullableK((s) => s.type),
	);

/**
 * maybeFormatRef :: ObjectSchema -> Maybe RefSchema
 * @internal
 */
export const maybeFormatRef = (schema: JsonSchema): Option<RefSchema> =>
	pipe(
		schema,
		maybeFormat,
		chain((format) => prop(format)(schema)),
		chain(maybeSimpleRef),
	);

/**
 * maybeRefExtended :: JsonSchema -> Maybe RefSchema
 * @internal
 */
export const maybeRefExtended = (schema: JsonSchema): Option<RefSchema> => {
	return pipe(
		schema,
		maybeRef,
		alt(() => maybeFormatRef(schema)),
	);
};

/**
 * maybeProperties :: JsonSchema -> Maybe { [key: string]: JsonSchema }
 * @internal
 */
export const maybeProperties = (
	schema: JsonSchema,
): Option<ObjectSchema["properties"]> => {
	return pipe(
		schema,
		ObjectSchema.decode,
		fromEither,
		chain((s) => fromNullable(s.properties)),
	);
};

/* -------------------------------------------------------------------------------------------------
 * Accessors
 * -----------------------------------------------------------------------------------------------*/

/**
 * def :: String -> JsonSchema -> Maybe JsonSchema
 * @since 0.0.3
 */
export const def =
	(key: string) => (schema: JsonSchema): Option<JsonSchema> => {
		return pipe(
			fromNullable(schema),
			chainNullableK((s) => s.$defs),
			chainNullableK((s) => s[key]),
		);
	};

// curried version of def
const defCurried = (schema: JsonSchema) => (key: string) => def(key)(schema);

/**
 * deepProp :: String -> JsonSchema -> Maybe JsonSchema
 * @since 0.0.5
 */
export const deepProp =
	(key: string) => (rootSchema: JsonSchema): Option<JsonSchema> => {
		const result = tailRec(
			{ key: key.split("."), schema: rootSchema },
			({ key, schema }) => {
				if (key.length === 0) {
					return right(schema);
				}
				const [head, ...tail] = key;

				return pipe(
					prop(head)(schema),
					alt(() =>
						pipe(
							rootSchema,
							def(head),
							chain((s) => prop(head)(s)),
						),
					),
					fold(
						() => right(schema),
						(s) => left({ key: tail, schema: s }),
					),
				);
			},
		);

		return fromNullable(result);
	};

/**
 * prop :: String -> JsonSchema -> Maybe JsonSchema
 * @since 0.0.3
 */
export const prop =
	(key: string) => (schema: JsonSchema): Option<JsonSchema> => {
		return pipe(
			maybeProperties(schema),
			chain(
				flow(
					fromNullable,
					map((p) => p[key]),
				),
			),
		);
	};

/**
 * resolveProperty :: string -> JsonSchema -> Option<JsonSchema>
 * @since 0.0.3
 */
export const propRec = (
	key: string,
	rootSchema: JsonSchema,
): Option<JsonSchema> =>
	pipe(
		rootSchema,
		deepProp(key),
		chain((schema) =>
			pipe(
				maybeRefExtended(schema),
				fold(
					() => some(schema),
					(ref) => refDefRec(ref)(rootSchema),
				),
			),
		),
	);

// curried version of prop
const propCurried = (schema: JsonSchema) => (key: string) => prop(key)(schema);

/**
 * ref :: JsonSchema -> Maybe String
 * @since 0.0.3
 */
export const refId = (schema: JsonSchema): Option<string> => {
	return pipe(
		schema,
		maybeRef,
		chainNullableK((s) => s.$ref),
	);
};

/**
 * refExtended :: JsonSchema -> Maybe String
 * @since 0.0.3
 * @internal
 */
export const refIdExtended = (schema: JsonSchema): Option<string> => {
	return pipe(
		schema,
		maybeRefExtended,
		chainNullableK((s) => s.$ref),
	);
};

/**
 * refDef :: JsonSchema -> JsonSchema -> Maybe JsonSchema
 * @since 0.0.3
 */
export const refDef =
	(schema: RefSchema) => (rootSchema: JsonSchema): Option<JsonSchema> => {
		return pipe(
			refId(schema),
			chain((id) => def(id)(rootSchema)),
		);
	};

// curried version of refDef
const refDefCurried = (rootSchema: JsonSchema) => (schema: RefSchema) =>
	refDef(schema)(rootSchema);

export const refDefExtended =
	(schema: JsonSchema) => (rootSchema: JsonSchema): Option<JsonSchema> => {
		return pipe(
			schema,
			maybeRefExtended,
			chain((ref) => refDef(ref)(rootSchema)),
		);
	};

// curried version of refDefExtended
const refDefExtendedCurried =
	(rootSchema: JsonSchema) => (schema: JsonSchema) =>
		refDefExtended(schema)(rootSchema);

/**
 * refDefRec :: JsonSchema -> JsonSchema -> Option JsonSchema
 * @since 0.0.3
 */
export const refDefRec =
	(schema: JsonSchema) => (rootSchema: JsonSchema): Option<JsonSchema> => {
		const _refDef = refDefExtendedCurried(rootSchema);
		const result = tailRec(schema, (s) => {
			const ref = toNullable(_refDef(s));
			if (!ref) {
				return right(s);
			} else {
				return left(ref);
			}
		});
		return fromNullable(result);
	};
