import { test, expect } from "vitest";
import { JsonSchema } from "../src/schemas/json";

export const flipEntitySchema = {
	$id: "/schemas/leadgen/flip_entity",
	type: "object",
	title: "FlipEntity",
	properties: {
		id: { type: "integer", title: "Id" },
		name: { type: "string", title: "Name" },
	},
};

test("test", () => {
	const decoded = JsonSchema.decode(flipEntitySchema);
	expect(decoded._tag).toBe("Right");
});
