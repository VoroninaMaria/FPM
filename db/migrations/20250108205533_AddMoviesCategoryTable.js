import { addPrimaryUuid, addTimestamps } from "../shared/index.js";

export const up = (knex) =>
  knex.schema.createTable("movie_categories", (table) => {
    addPrimaryUuid(knex, table);
    table
      .uuid("category_id")
      .index()
      .notNull()
      .references("id")
      .inTable("categories");
    table.uuid("movie_id").index().notNull().references("id").inTable("movies");
    addTimestamps(knex, table);
  });

export const down = (knex) => knex.schema.dropTable("movie_categoties");
