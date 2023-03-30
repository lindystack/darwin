import { expect, test, describe } from "vitest";
import { ObjectSchema } from "@darwin/schema";

import { Select } from "../src";
import { SelectionVisitor } from "../src/visitors/select";

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

describe("select visitor", () => {
  // this one shouldn't include the `foo` or `bar`, since no definitions were provided
  test("simple select", () => {
    const d = new Select(testSchema);
    const sv = new SelectionVisitor(d, "t1");
    const sql = sv.toString();

    expect(sql).toEqual(
      `select t1.id as "id"\r, t1.name as "name"\r, t1.tags as "tags"\r from public.test_schema t1\r`,
    );
  });
  // this one should include foo
  test("with foo definition", () => {
    const d = new Select(testSchema).definitions([fooSchema]);
    const sv = new SelectionVisitor(d, "t1");
    const sql = sv.toString();

    expect(sql).toEqual(
      `select t1.id as "id"\r, t1.name as "name"\r, t1.tags as "tags"\r, foo\r from public.test_schema t1\r`,
    );
  });
  // this one should include foo and bar
  test("with bar definition", () => {
    const d = new Select(testSchema).definitions([fooSchema, barSchema]);
    const sv = new SelectionVisitor(d, "t1");
    const sql = sv.toString();
    expect(sql).toEqual(
      `select t1.id as "id"\r, t1.name as "name"\r, t1.tags as "tags"\r, foo\r, bar\r from public.test_schema t1\r`,
    );
  });
});
