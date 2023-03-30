import { JsonSchema } from "@darwin/schema";

export function contains(value: any, jsonSchema: JsonSchema) {
  const schemaType = jsonSchema.type;

  switch (schemaType) {
    case "string":
      return `ilike '%${value}%'`;

    default:
      throw new Error(`\`contains\` unsupported type ${jsonSchema.type}`);
  }
}

export function doesNotContain(value: any, jsonSchema: JsonSchema) {
  return `not ${contains(value, jsonSchema)}`;
}
