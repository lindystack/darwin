import { JsonSchema, hasProperty } from "@darwin/schema";

export function equals(value: string | number, jsonSchema: JsonSchema) {
	const schemaType = jsonSchema.type;

	switch (schemaType) {
		case "string":
			return `= '${value}'`;
		case "integer":
		case "number":
		case "boolean":
			return `= ${value}`;

		case "object": {
			if (!hasProperty("id", jsonSchema)) {
				throw new Error("`equals` unsupported type object without `id`");
			}
			return `= ${value}`;
		}

		default:
			throw new Error(`\`equals\` unsupported type ${jsonSchema.type}`);
	}
}

export function doesNotEqual(value: string | number, jsonSchema: JsonSchema) {
	return `!${equals(value, jsonSchema)}`;
}
