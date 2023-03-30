import { snakeCase } from "lodash";
import { JsonSchema, isRelation, get$Ref } from "@darwin/schema";

import { SelectionVisitor } from "./select";

export class JsonSelectionVisitor extends SelectionVisitor {
	visitSelect() {
		this.append("select jsonb_build_object(\r");
		this.visitColumns();
		this.append(") ");
		this.append(`as ${this.sql.key}\r`);
		this.append(" from ");
		this.visitTable();
		this.append(` ${this.alias}\r`);
	}

	visitColumn(key: string, _prop: JsonSchema) {
		const snakeCaseKey = snakeCase(key);
		this.append(`'${key}', ${this.alias}.${snakeCaseKey}`);
		this.append("\r");
	}

	/**
	 * Basically the same as `super.shouldSkip` but we also want to skip
	 * any `#` references. This is because if we are in a `JsonSelectionVisitor`,
	 * we are already 1 level deep and we don't want to keep nesting.
	 */
	shouldSkip(prop: JsonSchema): boolean {
		if (isRelation(prop)) {
			const ref = get$Ref(prop);
			if (!(ref in this.sql.definitionsDict)) {
				return true;
			}
		}
		return false;
	}
}
