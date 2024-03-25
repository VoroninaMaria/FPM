import { addPrimaryUuid, addTimestamps } from "../shared/index.js";

export const up = async (knex) => {
  await knex.schema.createTable("locations", (table) => {
    addPrimaryUuid(knex, table);
    table.string("address").notNull();
    table.string("name").notNull();
    table
      .uuid("merchant_id")
      .index()
      .notNull()
      .references("id")
      .inTable("merchants");
    table.unique(["merchant_id", "name"]);
    addTimestamps(knex, table);
  });
};

export const down = async (knex) => {
  await knex.schema.dropTable("locations");
};
