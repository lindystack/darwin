import { Option, fromEither } from "fp-ts/Option";
import { pipe } from "fp-ts/function";

import { JsonSchema } from "../schemas";
import { ArraySchema } from "../schemas/array";

/**
 * maybeArray :: JsonSchema -> Maybe ArraySchema
 * @internal
 */
export const array = (schema: JsonSchema): Option<ArraySchema> =>
	pipe(schema, ArraySchema.decode, fromEither);
