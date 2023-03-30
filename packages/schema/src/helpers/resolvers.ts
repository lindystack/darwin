import { JsonSchema } from "../types/JsonSchema";
import { hasProperty, has$Ref, has$Defs, isSelfRef } from "./guards";

export function resolveSchema(key: string, schema: JsonSchema): JsonSchema {
	if (!hasProperty(key, schema)) {
		throw new Error(`Schema does not have property ${key}`);
	}

	let prop = schema.properties[key];

	if (has$Ref(prop)) {
		if (isSelfRef(prop)) {
			return schema;
		}

		if (!has$Defs(schema)) {
			throw new Error("Schema does not have $defs");
		}

		if (!has$Ref(prop)) {
			throw new Error("Schema does not have $ref");
		}

		let $ref = prop.$ref;

		if (!($ref in schema.$defs)) {
			throw new Error(`Schema does not have $defs for ${$ref}`);
		}

		return schema.$defs[$ref];
	}

	return prop;
}
