import * as t from "io-ts";

import { RefSchema } from "../types";

import { Common } from "./common";

// @internal
const RefType = t.type({
	$ref: t.string,
});

const RefSchema: t.Type<RefSchema> = t.recursion("RefSchema", () => {
	return t.intersection([Common, RefType]);
});

export { RefSchema };
