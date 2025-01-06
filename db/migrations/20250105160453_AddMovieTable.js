import { addPrimaryUuid, addTimestamps } from "../shared/index.js";

export const up = async (knex) => {
  await knex.schema.createTable("movies", (table) => {
    addPrimaryUuid(knex, table);
    table.string("name").notNull();
    table
      .uuid("category_id")
      .index()
      .notNull()
      .references("id")
      .inTable("categories");
    table.uuid("file_id").references("id").inTable("files");
    addTimestamps(knex, table);
  });
};

export const down = async (knex) => {
  await knex.schema.dropTable("movies");
};
