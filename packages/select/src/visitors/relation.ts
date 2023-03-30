import {
	JsonSchema,
	isOneToMany,
	isManyToOne,
	isRelation,
	get$Ref,
} from "@darwin/schema";

import { JsonSelectionVisitor } from "./selectJson";
import { Select } from "..";
import { Sql } from "../types";
import { Visitor } from "./abstract";
import { snakeCase } from "lodash";

// what is lateral join visitor going to need?
// it will return something like:
/*
       left join lateral (
            select jsonb_build_object (
            'id', t3.id
            , 'name', t3.name
            , 'email', t3.email
            ) as assigned_to
            from public.users t3
            where t1.assigned_to_id = t3.id
        ) _t3 on true
       */

// so it needs

// call LateralJoinVisitor
// return buf

export class RelationVisitor extends Visitor {
	constructor(sql: Sql) {
		super(sql);
		this.visit();
	}

	visit() {
		// loop over sql.aliases
		for (const [alias, key] of this.sql.aliases) {
			// Remember key being # means it's the root schema,
			// this is not the same as having a $ref of #.
			if (key === "#") {
				continue;
			}

			const prop = this.sql.schema.properties?.[key];

			if (prop === undefined) {
				throw new Error("property not found");
			}

			if (!isRelation(prop)) {
				continue;
			}

			const ref = get$Ref(prop);

			if (ref === "#") {
				this.visitJoin(prop, alias, key, this.sql.schema);
			} else {
				const refSchema = this.sql.definitionsDict[ref];
				if (refSchema === undefined) {
					throw new Error("ref not found");
				}

				this.visitJoin(prop, alias, key, refSchema);
			}
		}
	}

	visitJoin(prop: JsonSchema, alias: string, key: string, schema: JsonSchema) {
		this.append("left join lateral (\r");

		const s = new Select(schema, { key, alias, visitor: JsonSelectionVisitor });
		const sv = s.build().getSql();
		this.append(sv.toString());

		// if one-to-many, we assume the foreign key is on the other table
		// example: {properties: {users: {type: "array", items: { $ref: "#/definitions/user" } } } } -> `user_id` column on `users` table
		if (isOneToMany(prop)) {
			console.warn("need to figure out bazzes -> foreign key");
			const fk = `${alias}.${this.sql.tableName}_id`;
			console.warn("t1 is hardcoded here");
			const id = "t1.id";
			this.append(`where ${fk} = ${id}\r`);
		}
		// if many-to-one, we assume the foreign key is on this table
		// example: {properties: { company: { $ref: "#/definitions/company" } } } -> `company_id` column
		else if (isManyToOne(prop)) {
			const fk = `${alias}.id`;
			console.warn("t1 is hardcoded here");
			const id = `t1.${snakeCase(key)}_id`;
			this.append(`where ${fk} = ${id}\r`);
		}

		this.append(") ");
		this.append(`_${alias} on true\r`);
	}

	shouldSkip(prop: JsonSchema): boolean {
		if (isRelation(prop)) {
			const ref = get$Ref(prop);
			if (ref in this.sql.definitionsDict) {
				return false;
			}
		}
		return true;
	}
}
