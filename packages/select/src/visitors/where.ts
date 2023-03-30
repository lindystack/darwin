import { JsonSchema, hasProperty, hasProperties, isRelation, resolveSchema } from "@darwin/schema";

import { Visitor } from "./abstract";
import { Sql, Where } from "../types";
import { comparators } from "../comparators";

/**
 there are a few cases to handle here:
  1. self
    - this is the case where we are filtering on the root table
    - if we are using `equals`, then we search against the id column
    - if we are using any other operator, we need to find the $rep and run the comparison on that
  2. self property
    - this is pretty straight forward, we just need to add the alias to the key
  3. relation property (one-to-one, one-to-many, many-to-one, many-to-many)
    a. [one-to-one], [many-to-one]
      - (same procedure described in 1.)
      - both cases we end up with a single value, so we don't need to worry about any array logic
    b. [one-to-many]
      - in this case we will be nesting an array under the self property
      - since we are using the lateral join with json_build_object and group by (😮),
        we can't really use the where clause on top of that, since it will end up scanning the whole dataset.
        Instead, what we will do is add ANOTHER lateral join, but this time we will be using the `limit 1` clause,
        and we don't need to add it to the main select clause. This will allow us to run the where clause on the scalar value, not the array.
    c. [many-to-many]
      - to be determined...ought to be similar to one-to-many, however we have to determine where to run the comparison
 */
export class WhereVisitor extends Visitor {
  public alias: string;
  constructor(sql: Sql, public _alias?: string) {
    super(sql);
    this.visit();

    if (_alias) {
      this.alias = _alias;
    } else {
      this.alias = "t1";
    }
  }

  visit() {
    // do stuf...
  }

  visitWhere({ key, ...where }: Where) {
    // if ((key = this.sql.key)) {
    //   // handle self...
    //   return;
    // }

    let schema = this.sql.schema;
    let properties = hasProperties(schema) ? schema.properties : {};
    if (!hasProperty(key, schema)) {
      throw new Error(`Property ${key} not found in schema`);
    }

    let property = properties[key];

    if (isRelation(property)) {
      this.visitRelation({ key, ...where });
      return this;
    }

    // handle simple cases...
    this.visitSelfProp({ key, ...where });
    return this;
  }

  visitSelf(where: Where) {}

  /**
   * This is a specific case where we are filtering on the key itself.
   *
   * Say you have a table called `posts` that has a many-to-one relationship with `users`.
   * (Meaning, each post has a single user, but a user can have many posts).
   * So your json-schema may look like this:
   *
   * @example:
   * schema: {
   *    $id: 'posts',
   *    type: 'object',
   *    properties: { ...someprops, user: { $ref: '#/definitions/user' }
   * }
   *
   * @description (scenario 1)
   * So somewhere in your react code you are presenting your user with a filter ux.
   * In your filter, when the user clicks `user` you want to show them a list of users.
   * when they select a user, it ought to pass the id of that user to the querystring, right?
   * Otherwise, what are you even doing?? (kidding).
   *
   * Based on the example schema above though, and the filter scenario described,
   * we expect the querystring put through some parsing will look like this:
   *
   * @example:
   *  where: {
   *    key: 'user',
   *    operator: 'equals',
   *    value: 1
   *  }
   *
   * @description (scenario 2)
   * Now say we have another example just like the above, but the user selects `contains` instead of `equals`.
   * In those such cases, when we would be right to assume they want to compare against a string,
   * we cannot use the `id` column. Instead, we can check the `format` property of the schema,
   * to see if they have designated a specific column to use for the comparison. Note that using the `format`
   * key in this way is not a standard, but it is a convention that we are using here in @darwin/select.
   *
   *
   * @todo:
   *  - [ ] make the logic to get the queryKey more robust
   *
   * @param where
   */
  private visitRelation(where: Where) {
    let { key, operator, value } = where;

    if (!(operator in comparators)) {
      throw new Error(`Operator ${operator} not supported`);
    }

    let alias = this.sql.aliasLookup[key];
    const prop = resolveSchema(key, this.sql.schema);

    let func = comparators[operator];
    let slug = func(value, prop);

    let queryKey = operator.includes("quals") ? "id" : key;

    this.append(`where ${alias}.${queryKey} ${slug}`);
  }

  visitSelfProp(where: Where) {
    let key = `${this.alias}.${where.key}`;
    let func = comparators[where.operator];
    let slug = func(where.value, resolveSchema(where.key, this.sql.schema));
    this.append(`where ${key} ${slug}`);
  }

  visitRelationProp(where: Where) {}

  shouldSkip(prop: JsonSchema) {
    // we may not need this
    return false;
  }
}
