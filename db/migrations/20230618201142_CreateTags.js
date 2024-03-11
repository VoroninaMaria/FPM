import { addPrimaryUuid, addTimestamps } from "../shared/index.js";

export const up = (knex) =>
  knex.schema.createTable("tags", (table) => {
    addPrimaryUuid(knex, table);
    table.string("name");
    table
      .uuid("merchant_id")
      .index()
      .notNull()
      .references("id")
      .inTable("merchants");
    table.unique(["merchant_id", "name"]);
    addTimestamps(knex, table);
  });

export const down = (knex) => knex.schema.dropTable("tags");
