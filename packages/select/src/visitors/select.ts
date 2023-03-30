import { snakeCase } from "lodash";
import { properties, JsonSchema, isManyToOne, isRelation, get$Ref } from "@darwin/schema";
import { Visitor } from "./abstract";
import { Sql } from "../types";

export class SelectionVisitor extends Visitor {
  constructor(sql: Sql, public alias: string) {
    super(sql);
    this.visitSelect();
  }

  visitSelect() {
    this.append("select ");
    this.visitColumns();
    this.append(" from ");
    this.visitTable();
    this.append(` ${this.alias}\r`);
  }

  visitTable() {
    const namespace = this.sql.namespace;
    const tableName = this.sql.tableName;

    this.append(`${namespace === "core" ? "public" : namespace}.${tableName}`);
  }

  visitColumns() {
    const propIterator = properties(this.sql.schema);
    const firstColumn = propIterator.next();
    this.visitColumn(firstColumn.value[0], firstColumn.value[1]);

    for (const [key, prop] of propIterator) {
      if (this.shouldSkip(prop)) {
        continue;
      }
      this.visitComma();
      this.visitColumn(key, prop);
    }
  }

  shouldSkip(prop: JsonSchema) {
    if (isRelation(prop)) {
      // is included?
      const ref = get$Ref(prop);
      if (!(ref in this.sql.definitionsDict || ref === "#")) {
        return true;
      }
    }
    return false;
  }

  visitColumn(key: string, prop: JsonSchema) {
    if (isRelation(prop)) {
      // stash the alias for later
      this.sql.alias(key);
      this.append(key);
      this.append("\r");
    } else {
      const snakeCaseKey = snakeCase(key);
      this.append(`${this.alias}.${snakeCaseKey}`);
      this.append(` as "${key}"`);
      this.append("\r");
    }
  }

  visitComma() {
    this.append(", ");
  }
}
