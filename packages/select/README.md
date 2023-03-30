<h1 align="center">Darwin Select</h1>

<p align="center">
stuff
</p>

```
import {d} from '@darwin/sql

const mySchema = {
    $id: '/schemas/core/my_schema',
    type: 'object',
    properties: {
        id: {type: 'string'},
        name: {type: 'string'},
        age: {type: 'number'},
        created_at: {type: 'string'},
        updated_at: {type: 'string'},
    },
}

const sql = d(mySchema).build()

```

## About

Generate sql queries from a json schema.

## Features
- No need for any post-query processing. Let Postgres do the work.
- Auto-detect many-to-one relationships from ```$ref```.
- Auto-detect one-to-many relationships from ```{type: 'array', items: {type: 'object', $ref: '...'}}```.
- Handles nesting of relational data using Postgres lateral joins and ```json_build_object```.
- Supports pagination, sorting, and filtering -- even on nested data.

## Documenation