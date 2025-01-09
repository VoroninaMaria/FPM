import { addPrimaryUuid, addTimestamps } from "../shared/index.js";

export const up = async (knex) => {
  await knex.schema.createTable("halls", (table) => {
    addPrimaryUuid(knex, table);
    table.string("name").notNull();
    table.float("min_price").notNull();
    table.float("places");
    table
      .uuid("location_id")
      .index()
      .notNull()
      .references("id")
      .inTable("locations");
    addTimestamps(knex, table);
  });
};

export const down = async (knex) => {
  await knex.schema.dropTable("halls");
};
