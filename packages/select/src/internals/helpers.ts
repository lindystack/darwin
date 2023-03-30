import { JsonSchema, isObjectSchema, has$Id } from "@darwin/schema";

type DefinitionTuple = [string, JsonSchema];

// @internal
export function* iterateDefinitions(defs: JsonSchema[]): Generator<DefinitionTuple, void, undefined> {
  for (const def of defs) {
    if (isObjectSchema(def) && has$Id(def)) {
      yield [def.$id, def];
    }
  }
}

export function getTableName(str: `/${string}/${string}${string}`) {
  const [, , , tableName] = str.split("/");

  return tableName;
}

export function getNamespace(str: `/${string}/${string}${string}`) {
  const [, , namespace, _] = str.split("/");

  return namespace;
}

/**
 * first word gets lowercased, all other words get uppercased
 * @param str
 */
export function lowerCamelCase(str: string) {
  const [first, ...rest] = str.split("_");
  return `${first.toLowerCase()}${rest.map((s) => s[0].toUpperCase() + s.slice(1)).join("")}`;
}
