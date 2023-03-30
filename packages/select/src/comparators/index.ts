import { JsonSchema } from "@darwin/schema";
import { equals, doesNotEqual } from "./equals";
import { contains, doesNotContain } from "./contains";

type Comparators = {
  [key: string]: (value: any, jsonSchema: JsonSchema) => string;
};

export const comparators: Comparators = {
  equals,
  doesNotEqual,
  contains,
  doesNotContain,
};
