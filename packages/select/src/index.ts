import { JsonSchema, has$Id, hasProperties, isManyToOne, has$Defs } from "@darwin/schema";

import { iterateDefinitions, getTableName, getNamespace, lowerCamelCase } from "./internals/helpers";
import { JsonSelectionVisitor } from "./visitors/selectJson";
import { RelationVisitor } from "./visitors/relation";
import { SelectionVisitor } from "./visitors/select";
import { Sql } from "./types";
import { StringBuffer } from "./internals/stringBuffer";

export function d(schema: JsonSchema) {
  return new Select(schema);
}

export function isJunction(schema: JsonSchema) {
  // if it only has two properties and both show true for `isManyToOne`
  if (hasProperties(schema) && Object.keys(schema.properties).length === 2) {
    return Object.values(schema.properties).every((prop) => {
      return isManyToOne(prop);
    });
  }
  return false;
}

type Pagination = {
  page: number;
  pageSize: number;
};

type Options = {
  key?: string;
  alias?: string;
  visitor?: typeof JsonSelectionVisitor | typeof SelectionVisitor;
};

export class Select implements Sql {
  public schema: JsonSchema;
  constructor(_schema: JsonSchema, public options?: Options) {
    this.schema = _schema;
  }
  definitionsDict: Record<string, JsonSchema> = {};
  aliasDict: Record<string, string> = {};
  aliasLookup: Record<string, string> = {};
  buf: StringBuffer | undefined;

  /**
   * Creates a lookup dictionary for definitions of other schemas.
   * Indexes by the $id of the schema.
   *
   * @example
   *  properties: {
   *    assignedTo: { $ref: "/schemas/Person" }
   * }
   *
   * definitionsDict: {
   *   "/schemas/Person": { ... }
   * }
   *
   * @param defs
   * @returns
   */
  definitions(defs: JsonSchema[]) {
    console.warn("TODO: please implement `include()` soon");
    for (const [id, def] of iterateDefinitions(defs)) {
      this.definitionsDict[id] = def;

      if (!has$Defs(this.schema)) {
        Object.assign(this.schema, { $defs: {} });
      }

      // @ts-expect-error
      this.schema.$defs[id] = def;
    }
    return this;
  }

  include(string: []) {
    throw new Error("not implemented");
  }

  build() {
    let alias: string;
    if (this.options?.alias !== undefined) {
      alias = this.options.alias;
      this.aliasDict[this.options.alias] = "#";
    } else {
      alias = this.alias("#");
    }

    if (this.options?.visitor !== undefined) {
      this.buf = new this.options.visitor(this, alias);
    } else {
      this.buf = new SelectionVisitor(this, alias);
    }

    const relations = new RelationVisitor(this);
    this.buf.append(relations.toString());

    return this;
  }

  paginate({ page, pageSize }: Pagination) {
    if (!(page >= 0)) {
      throw new Error("page must be >= 1");
    }
    if (!(pageSize >= 1)) {
      throw new Error("pageSize must be >= 1");
    }

    this.buf?.append(`LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`);
    return this;
  }

  getSql() {
    if (this.buf === undefined) {
      throw new Error("please call `build()` first");
    }

    return this.buf.toString();
  }

  // @deprecated
  getDef(key: string) {
    return this.definitionsDict[key];
  }

  /**
   * Set an alias for a key. Automatically increments the alias.
   * @param key
   * @returns
   */
  alias(key: string) {
    const keys = Object.keys(this.aliasDict).map((k) => parseInt(k.slice(1)));
    const max = Math.max(...keys);
    // if max is -Infinity, then we have no aliases, so we start at 1
    const next = max === -Infinity ? 1 : max + 1;

    this.aliasDict[`t${next}`] = key;
    this.aliasLookup[key] = `t${next}`;
    return `t${next}`;
  }

  get key() {
    if (this.options?.key !== undefined) {
      return this.options.key;
    }
    return lowerCamelCase(this.tableName);
  }

  get aliases() {
    return Object.entries(this.aliasDict)[Symbol.iterator]();
  }

  get tableName() {
    if (has$Id(this.schema)) {
      // @ts-expect-error
      return getTableName(this.schema.$id);
    }
    throw new Error("no $id");
  }

  get namespace() {
    if (has$Id(this.schema)) {
      // @ts-expect-error
      return getNamespace(this.schema.$id);
    }
    throw new Error("no $id");
  }
}
