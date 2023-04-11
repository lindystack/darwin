import * as t from "io-ts";

import { RefSchema } from "../types";

const RefSchema = t.type({
	$ref: t.string,
});

// const RefSchema: t.Type<RefSchema> = t.recursion("RefSchema", () => {
// 	return t.intersection([RefType]);
// });

export { RefSchema };
