import { addTimestamps, addPrimaryUuid } from "../shared/index.js";

export const up = async (knex) => {
  await knex.schema.createTable("abilities", (table) => {
    addPrimaryUuid(knex, table);
    table
      .uuid("membership_id")
      .notNull()
      .references("id")
      .inTable("memberships");
    table.string("name").notNull();
    table.string("description").notNull();
    table.integer("regular_price").notNull();
    table.integer("discount_price").notNull();
    addTimestamps(knex, table);
    table.unique(["membership_id", "name"]);
  });
};

export const down = async (knex) => {
  await knex.schema.dropTable("abilities");
};
