import { Option, alt, chain, chainNullableK, fromEither } from "fp-ts/Option";
import { pipe } from "fp-ts/function";

import { JsonSchema } from "../schemas";
import { RefSchema } from "../schemas/ref";
import { array } from "./array";

/**
 * simpleRef :: JsonSchema -> Maybe RefSchema
 * @internal
 */
const simpleRef = (schema: JsonSchema): Option<RefSchema> =>
	pipe(schema, RefSchema.decode, fromEither);

/**
 * arrayRef :: JsonSchema -> Maybe RefSchema
 * @internal
 */
const arrayRef = (schema: JsonSchema): Option<RefSchema> =>
	pipe(
		schema,
		array,
		chainNullableK((s) => s.items),
		chain(simpleRef),
	);

/**
 *
 * ref :: JsonSchema -> Maybe RefSchema
 * @internal
 */
const ref = (schema: JsonSchema): Option<RefSchema> =>
	pipe(
		schema,
		simpleRef,
		alt(() => arrayRef(schema)),
	);

/**
 * ref :: JsonSchema -> Maybe String
 * @since 0.0.3
 */
export const refId = (schema: JsonSchema): Option<string> => {
	return pipe(
		schema,
		ref,
		chainNullableK((s) => s.$ref),
	);
};
