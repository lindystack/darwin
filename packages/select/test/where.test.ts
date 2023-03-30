import { expect, test, describe } from "vitest";
import { ObjectSchema } from "@darwin/schema";

import { Select } from "../src";
import { WhereVisitor } from "../src/visitors/where";

import { Where } from "../src/types";

export const testSchema: ObjectSchema = {
  $id: "/schemas/core/test_schema",
  type: "object",
  title: "TestSchema",
  properties: {
    id: { type: "integer", title: "Id" },
    name: { type: "string", title: "Name" },
    tags: {
      type: "array",
      title: "Tags",
      items: {
        type: "string",
        enum: ["foo", "bar", "baz"],
      },
    },
    foo: { $ref: "/schemas/core/foo" },
    bar: { type: "array", items: { $ref: "/schemas/core/bar" } },
  },
};

const fooSchema: ObjectSchema = {
  $id: "/schemas/core/foo",
  type: "object",
  title: "Foo",
  properties: {
    id: { type: "integer", title: "Id" },
    name: { type: "string", title: "Name" },
  },
};

const barSchema: ObjectSchema = {
  $id: "/schemas/core/bar",
  type: "object",
  title: "Bar",
  properties: {
    id: { type: "integer", title: "Id" },
    name: { type: "string", title: "Name" },
  },
};

describe("where visitor", () => {
  test("where id = 1", () => {
    const d = new Select(testSchema);

    let where: Where = {
      key: "id",
      operator: "equals",
      value: 1,
    };

    const sv = new WhereVisitor(d).visitWhere(where);
    expect(sv).toBeDefined();
    const sql = sv.toString();

    expect(sql).toEqual(`where t1.id = 1`);
  });

  test("where name = 'foobar'", () => {
    const d = new Select(testSchema);

    let where: Where = {
      key: "name",
      operator: "equals",
      value: "foobar",
    };

    const sv = new WhereVisitor(d).visitWhere(where);
    expect(sv).toBeDefined();
    const sql = sv.toString();

    expect(sql).toEqual(`where t1.name = 'foobar'`);
  });

  test("where name != 'foobar'", () => {
    const d = new Select(testSchema);

    let where: Where = {
      key: "name",
      operator: "doesNotEqual",
      value: "foobar",
    };

    const sv = new WhereVisitor(d).visitWhere(where);
    expect(sv).toBeDefined();
    const sql = sv.toString();

    expect(sql).toEqual(`where t1.name != 'foobar'`);
  });

  test("where name not ilike '%foo%'", () => {
    const d = new Select(testSchema);

    let where: Where = {
      key: "name",
      operator: "contains",
      value: "foo",
    };

    const sv = new WhereVisitor(d).visitWhere(where);
    expect(sv).toBeDefined();
    const sql = sv.toString();

    expect(sql).toEqual(`where t1.name ilike '%foo%'`);
  });

  test("where name not ilike '%foo%'", () => {
    const d = new Select(testSchema);

    let where: Where = {
      key: "name",
      operator: "doesNotContain",
      value: "foo",
    };

    const sv = new WhereVisitor(d).visitWhere(where);
    expect(sv).toBeDefined();
    const sql = sv.toString();

    expect(sql).toEqual(`where t1.name not ilike '%foo%'`);
  });

  test("where t2.id = 1", () => {
    const d = new Select(testSchema).definitions([fooSchema]);

    let where: Where = {
      key: "foo",
      operator: "equals",
      value: "1",
    };

    d.build();

    const sv = new WhereVisitor(d).visitWhere(where);
    const sql = sv.toString();

    expect(sql).toEqual(`where t2.id = 1`);
  });
});
