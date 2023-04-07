import { ObjectSchema, JsonSchema, ArraySchema, StringSchema } from "../types";

export const properties = function* (
	schema: ObjectSchema,
): IterableIterator<[string, JsonSchema]> {
	const props = schema.properties || {};
	for (const key in props) {
		if (props.hasOwnProperty(key)) {
			yield [key, props[key]];
		}
	}
};

export function get$Ref(
	schema:
		| (JsonSchema & { $ref: string })
		| (ArraySchema & { items: { $ref: string } }),
): string {
	if (isManyToOne(schema)) {
		return schema.$ref;
	}
	return schema.items.$ref;
}

/* -------------------------------------------------------------------------------------------------
 * Special Vocabulary Type Guards
 * -----------------------------------------------------------------------------------------------*/

export function has$Rep(
	schema: ObjectSchema,
): schema is ObjectSchema & { properties: { $rep: { const: string } } } {
	return (
		hasProperty("$rep", schema) &&
		typeof schema.properties.$rep === "object" &&
		"const" in schema.properties.$rep
	);
}

export function isOptions(schema: JsonSchema): schema is { enum: unknown[] } {
	return hasEnum(schema);
}

// tags should be an array schema with items containing an enum
export function isTags(
	schema: JsonSchema,
): schema is ArraySchema & { items: { enum: unknown[] } } {
	return isArray(schema) && hasItems(schema) && isOptions(schema.items);
}

/* -------------------------------------------------------------------------------------------------
 * Identifier Type Guards
 * -----------------------------------------------------------------------------------------------*/

export function hasProperty(
	key: string,
	schema: JsonSchema,
): schema is ObjectSchema & { properties: Record<string, JsonSchema> } & {
	properties: { [key: string]: JsonSchema };
} {
	return hasProperties(schema) && key in schema.properties;
}

export function isSelfRef(schema: JsonSchema): schema is { $ref: "#" } {
	return isRef(schema) && schema.$ref === "#";
}

export function isRelation(
	schema: JsonSchema,
): schema is { $ref: string } | (ArraySchema & { items: { $ref: string } }) {
	return isRef(schema) || isArrayOfRefs(schema);
}

// @deprecated
export function isOneToMany(
	schema: JsonSchema,
): schema is ArraySchema & { items: { $ref: string } } {
	return isArray(schema) && hasItems(schema) && isRef(schema.items);
}

/* -------------------------------------------------------------------------------------------------
 * "Schema type" guards
 * -----------------------------------------------------------------------------------------------*/

// @deprecated
export function isManyToOne(schema: JsonSchema): schema is { $ref: string } {
	return isRef(schema);
}

export function isArrayOfRefs(
	schema: JsonSchema,
): schema is ArraySchema & { items: { $ref: string } } {
	return isArray(schema) && hasItems(schema) && isRef(schema.items);
}

export function isArray(schema: JsonSchema): schema is ArraySchema {
	return schema.type === "array";
}

export function isArrayOfStrings(
	schema: JsonSchema,
): schema is ArraySchema & { items: { type: "string" } } {
	return isArray(schema) && hasItems(schema) && isStringSchema(schema.items);
}

export function isObject(schema: JsonSchema): schema is ObjectSchema {
	return schema.type === "object";
}

export function isObjectSchema(schema: JsonSchema): schema is ObjectSchema {
	return schema.type === "object";
}

export function isStringSchema(schema: JsonSchema): schema is StringSchema {
	return schema.type === "string";
}

export function isRef(schema: JsonSchema): schema is { $ref: string } {
	return typeof schema === "object" && schema !== null && "$ref" in schema;
}

/* -------------------------------------------------------------------------------------------------
 * Accessor guards
 * -----------------------------------------------------------------------------------------------*/

export function hasEnum(schema: JsonSchema): schema is { enum: unknown[] } {
	return "enum" in schema && Array.isArray(schema.enum);
}

export function hasProperties(
	schema: JsonSchema,
): schema is ObjectSchema & { properties: Record<string, JsonSchema> } {
	return (
		isObjectSchema(schema) &&
		"properties" in schema &&
		typeof schema.properties === "object" &&
		schema.properties !== null
	);
}

export function hasItems(schema: JsonSchema): schema is { items: JsonSchema } {
	return "items" in schema;
}

export function has$Id(schema: JsonSchema): schema is { $id: string } {
	return "$id" in schema;
}

export function has$Defs(
	schema: JsonSchema,
): schema is { $defs: Record<string, JsonSchema> } {
	return (
		"$defs" in schema &&
		typeof schema.$defs === "object" &&
		schema.$defs != null
	);
}

export function has$Ref(schema: JsonSchema): schema is { $ref: string } {
	return "$ref" in schema;
}

export function has(
	key: string,
	schema: JsonSchema,
): schema is { [key: string]: unknown } {
	return key in schema;
}

export function hasTitle(schema: JsonSchema): schema is { title: string } {
	return (
		"title" in schema &&
		typeof schema.title === "string" &&
		schema.title.length > 0
	);
}
