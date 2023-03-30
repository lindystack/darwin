import { JsonSchema } from "@darwin/schema";

import { Sql } from "../types";
import { StringBuffer } from "../internals/stringBuffer";

export abstract class Visitor extends StringBuffer {
  constructor(public sql: Sql) {
    super();
  }
  abstract shouldSkip(prop: JsonSchema): boolean;

  visitComma() {
    this.append(", ");
  }
}
