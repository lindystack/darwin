import { Option, chainNullableK, fromNullable, chain } from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import * as R from "fp-ts/Record";

import { JsonSchema } from "../schemas";

/**
 * def :: String -> JsonSchema -> Maybe JsonSchema
 * @since 0.0.3
 */
export const def =
	(key: string) => (schema: JsonSchema): Option<JsonSchema> => {
		return pipe(
			fromNullable(schema),
			chainNullableK((s) => s.$defs),
			chain((s) => R.lookup(key, s)),
		);
	};
