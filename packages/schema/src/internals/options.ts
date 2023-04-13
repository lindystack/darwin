import { Option, chainNullableK, fromNullable } from "fp-ts/Option";
import { pipe } from "fp-ts/function";

import { JsonSchema } from "../schemas";

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
