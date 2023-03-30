import { expect, test, describe } from "vitest";
import { ObjectSchema } from "@darwin/schema";

import { Select } from "../src";
import { JsonSelectionVisitor } from "../src/visitors/selectJson";

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

describe("json select visitor", () => {
  // this one shouldn't include the `foo` or `bar`, since no definitions were provided
  test("simple select", () => {
    const d = new Select(testSchema);
    const sv = new JsonSelectionVisitor(d, "t1");
    const sql = sv.toString();

    console.log({ sql });

    expect(sql).toEqual(
      "select jsonb_build_object(\r'id', t1.id\r, 'name', t1.name\r, 'tags', t1.tags\r) as testSchema\r from public.test_schema t1\r",
    );
  });
});
