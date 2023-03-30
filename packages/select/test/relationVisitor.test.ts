import { expect, test, describe } from "vitest";
import { ObjectSchema } from "@darwin/schema";

import { Select } from "../src";
import { RelationVisitor } from "../src/visitors/relation";

const fooSchema: ObjectSchema = {
  $id: "/schemas/core/foo",
  type: "object",
  title: "Foo",
  properties: {
    id: { type: "integer", title: "Id" },
    name: { type: "string", title: "Name" },
    bazzes: { type: "array", items: { $ref: "/schemas/core/baz" } },
    bar: { $ref: "/schemas/core/bar" },
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

const bazSchema: ObjectSchema = {
  $id: "/schemas/core/baz",
  type: "object",
  title: "Baz",
  properties: {
    id: { type: "integer", title: "Id" },
    name: { type: "string", title: "Name" },
  },
};

describe("relation visitor", () => {
  test("should create join for many-to-one", () => {
    const s = new Select(fooSchema).definitions([barSchema]);
    const rv = new RelationVisitor(s);
    s.build();
    rv.visit();

    const output = rv.toString();

    expect(output).toEqual(
      "left join lateral (\rselect jsonb_build_object(\r'id', t2.id\r, 'name', t2.name\r) as bar\r from public.bar t2\rwhere t2.id = t1.bar_id\r) _t2 on true\r",
    );
  });

  test("should create join for one-to-many", () => {
    const s = new Select(fooSchema).definitions([bazSchema]);
    const rv = new RelationVisitor(s);
    s.build();
    rv.visit();

    const output = rv.toString();

    expect(output).toEqual(
      "left join lateral (\rselect jsonb_build_object(\r'id', t2.id\r, 'name', t2.name\r) as bazzes\r from public.baz t2\rwhere t2.foo_id = t1.id\r) _t2 on true\r",
    );
  });

  test("self join", () => {
    const schema: ObjectSchema = {
      $id: "/schemas/core/foo",
      type: "object",
      title: "Foo",
      properties: {
        id: { type: "integer", title: "Id" },
        parent: { $ref: "#" },
      },
    };

    const s = new Select(schema);
    const rv = new RelationVisitor(s);
    s.build();
    rv.visit();

    const output = rv.toString();

    expect(output).toEqual(
      "left join lateral (\rselect jsonb_build_object(\r'id', t2.id\r) as parent\r from public.foo t2\rwhere t2.id = t1.parent_id\r) _t2 on true\r",
    );
  });
});
