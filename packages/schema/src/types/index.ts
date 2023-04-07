// borrowed from here https://github.com/eemeli/yaml/blob/c80d4c2ba972e53cc60ddd2d7136446bd9dae740/src/schema/json-schema.ts

// https://json-schema.org/draft/2020-12/json-schema-core.html
// https://json-schema.org/draft/2020-12/json-schema-validation.html

export type JsonSchema =
	| ArraySchema
	| ObjectSchema
	| NumberSchema
	| IntegerSchema
	| StringSchema
	| RefSchema;

export type JsonType =
	| "array"
	| "object"
	| "string"
	| "number"
	| "integer"
	| "boolean"
	| "null";

/* -------------------------------------------------------------------------------------------------
 * Common
 * -----------------------------------------------------------------------------------------------*/

interface Primitives {
	// rome-ignore lint/suspicious/noExplicitAny: we need this one because io-ts types can't `satify` the `JsonSchema` type
	type?: any;
	const?: unknown;
	enum?: unknown[];
	format?: string;
}

// Logic and conditionals
interface Conditionals {
	allOf?: JsonSchema[];
	anyOf?: JsonSchema[];
	oneOf?: JsonSchema[];
	not?: JsonSchema;
	if?: JsonSchema;
	then?: JsonSchema;
	else?: JsonSchema;
}

// References
export interface References {
	$id?: string;
	$defs?: Record<string, JsonSchema>;
	$anchor?: string;
	$dynamicAnchor?: string;
	$ref?: string;
	$dynamicRef?: string;
}

// Meta
interface Meta {
	$schema?: string;
	$vocabulary?: Record<string, boolean>;
	$comment?: string;
}

// Annotations
interface Annotations {
	default?: unknown;
	deprecated?: boolean;
	readOnly?: boolean;
	writeOnly?: boolean;
	title?: string;
	description?: string;
	examples?: unknown[];
}

// Common schema
interface CommonSchema
	extends Primitives,
		Conditionals,
		References,
		Meta,
		Annotations {}

export interface RefSchema extends CommonSchema {
	$ref: string;
}

/* -------------------------------------------------------------------------------------------------
 * Array
 * -----------------------------------------------------------------------------------------------*/

export interface ArraySpecificFields {
	prefixItems?: JsonSchema[];
	items?: JsonSchema;
	contains?: JsonSchema;
	unevaluatedItems?: JsonSchema;
	maxItems?: number; // non-negative integer
	minItems?: number; // non-negative integer
	uniqueItems?: boolean;
	maxContains?: number; // non-negative integer
	minContains?: number; // non-negative integer
}

export interface ArraySchema extends CommonSchema, ArraySpecificFields {
	type: "array";
}

/* -------------------------------------------------------------------------------------------------
 * Object
 * -----------------------------------------------------------------------------------------------*/

export interface ObjectSpecificFields {
	properties?: Record<string, JsonSchema>;
	patternProperties?: Record<string, JsonSchema>; // key is regexp
	additionalProperties?: JsonSchema;
	propertyNames?: JsonSchema;
	unevaluatedProperties?: JsonSchema;
	maxProperties?: number; // non-negative integer
	minProperties?: number; // non-negative integer
	required?: string[];
	dependentRequired?: Record<string, string[]>;
	dependentSchemas?: Record<string, JsonSchema>;
}

export interface ObjectSchema extends CommonSchema, ObjectSpecificFields {
	type: "object";
	const?: { [key: string]: unknown };
	enum?: { [key: string]: unknown }[];
	default?: { [key: string]: unknown };
	examples?: { [key: string]: unknown }[];
}

/* -------------------------------------------------------------------------------------------------
 * String
 * -----------------------------------------------------------------------------------------------*/

export interface StringSpecificFields {
	maxLength?: number; // non-negative integer
	minLength?: number; // non-negative integer
	pattern?: string; // regex
	contentEncoding?: string;
	contentMediaType?: string;
	contentSchema?: JsonSchema;
}

export interface StringSchema extends CommonSchema, StringSpecificFields {
	type: "string";
	const?: string;
	enum?: string[];
	default?: string;
	examples?: string[];
}

/* -------------------------------------------------------------------------------------------------
 * Number and Integer
 * -----------------------------------------------------------------------------------------------*/

interface NumberSpecificFields {
	multipleOf?: number;
	maximum?: number;
	exclusiveMaximum?: number;
	minimum?: number;
	exclusiveMinimum?: number;
}

export interface NumberSchema extends CommonSchema, NumberSpecificFields {
	type: "number";
	const?: number;
	enum?: number[];
	default?: number;
	examples?: number[];
}

export interface IntegerSchema extends CommonSchema, NumberSpecificFields {
	type: "integer";
	const?: number;
	enum?: number[];
	default?: number;
	examples?: number[];
}
