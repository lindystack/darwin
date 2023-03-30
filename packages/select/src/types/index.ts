import { JsonSchema, ObjectSchema } from "@darwin/schema";

export interface Sql {
  namespace: string;
  tableName: string;
  // @deprecated
  definitionsDict: Record<string, JsonSchema>;
  schema: ObjectSchema;
  aliasLookup: Record<string, string>;
  aliases: IterableIterator<[string, string]>;
  key: string;
  alias: (key: string) => string;
  getDef(key: string): JsonSchema | undefined;
}

export interface Where {
  key: string;
  operator: string;
  value: any;
}
