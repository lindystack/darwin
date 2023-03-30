import { test, expect, assert } from "vitest";

import { ObjectSchema } from "..";
import { isOneToMany, hasProperties, isRef } from "..";

export const flipEntitySchema: ObjectSchema = {
  $id: "/schemas/leadgen/flip_entity",
  type: "object",
  title: "FlipEntity",
  properties: {
    id: { type: "integer", title: "Id" },
    name: { type: "string", title: "Name" },
    parent: { $ref: "#", title: "Parent" },
    onboardingStatus: { type: "string", title: "Onboarding Status", enum: ["foo", "bar", "baz"] },
    researchStatus: { type: "string", title: "Research Status", enum: ["foo", "bar", "baz"] },
    assignedTo: { $ref: "/schemas/core/users", title: "Assigned To" },
    contacts: {
      type: "array",
      title: "Contacts",
      items: { $ref: "/schemas/leadgen/flip_entity_contact", title: "Contact" },
    },
    followUpBy: { type: "string", title: "Follow Up By", format: "date" },
    tags: {
      type: "array",
      title: "Tags",
      items: {
        type: "string",
        enum: ["foo", "bar", "baz"],
      },
    },
  },
};

test("test", () => {
  assert(hasProperties(flipEntitySchema));
  expect(isOneToMany(flipEntitySchema.properties.tags)).toBe(false);
  expect(isOneToMany(flipEntitySchema.properties.contacts)).toBe(true);
  expect(isRef(flipEntitySchema.properties.assignedTo)).toBe(true);
});
